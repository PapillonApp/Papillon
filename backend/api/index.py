import os
import json
import base64
import mimetypes
from typing import Optional, List, Dict, Any
from datetime import datetime, date, timedelta

from fastapi import FastAPI, HTTPException, Header, Depends, Query, Body, Response
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import hashlib
import logging

logger = logging.getLogger("aether")

# NOTE: `pronotepy` (lourd, wheel Rust via cryptography) est importé en lazy
# dans init_client / endpoints d'auth pour réduire le cold start Vercel.
# Optional Upstash Redis import
try:
    from upstash_redis import Redis
    UPSTASH_URL = os.environ.get("UPSTASH_REDIS_REST_URL")
    UPSTASH_TOKEN = os.environ.get("UPSTASH_REDIS_REST_TOKEN")
    redis_client = Redis(url=UPSTASH_URL, token=UPSTASH_TOKEN) if UPSTASH_URL and UPSTASH_TOKEN else None
except Exception:
    redis_client = None


def _cache_key(prefix: str, auth: Dict[str, Any], *parts: Any) -> str:
    """Clé de cache stable (jamais de token/mot de passe dedans)."""
    raw = "|".join([
        prefix,
        str(auth.get("url", "")),
        str(auth.get("username", "")),
        str(auth.get("uuid", "")),
        str(auth.get("account_type", "eleve")),
        *[str(p) for p in parts],
    ])
    return "aether:" + hashlib.sha256(raw.encode("utf-8")).hexdigest()


def cache_get(key: str) -> Optional[Any]:
    if redis_client is None:
        return None
    try:
        val = redis_client.get(key)
        if val is None:
            return None
        return json.loads(val) if isinstance(val, str) else val
    except Exception as e:
        logger.warning(f"redis get failed: {e}")
        return None


def cache_set(key: str, value: Any, ttl_s: int) -> None:
    if redis_client is None:
        return
    try:
        redis_client.set(key, json.dumps(value, default=str), ex=ttl_s)
    except Exception as e:
        logger.warning(f"redis set failed: {e}")


def _set_cache_header(response: Response, hit: bool) -> None:
    """Phase 6 quick win: expose cache status (HIT/MISS) for observability.

    No behavior change — payloads inchangés, seul header ajouté.
    """
    response.headers["X-Aether-Cache"] = "HIT" if hit else "MISS"


def parse_ymd(value: str, label: str) -> date:
    try:
        return datetime.strptime(value, "%Y-%m-%d").date()
    except Exception:
        raise HTTPException(status_code=422, detail=f"Date invalide pour {label} (attendu YYYY-MM-DD)")


def clamp_window(start_d: date, end_d: date, max_days: int = 62) -> tuple:
    if end_d < start_d:
        raise HTTPException(status_code=422, detail="to_date antérieur à from_date")
    if (end_d - start_d).days > max_days:
        raise HTTPException(status_code=422, detail=f"Fenêtre trop large (max {max_days} jours)")
    return start_d, end_d

app = FastAPI(
    title="Aether Pronotepy API",
    version="1.2.0",
    description="Microservice serverless reliant Aether Mobile à Pronote via pronotepy 2.15.7 avec support des comptes parents, MFA/2FA, et parité complète des entités."
)

cors_origins = os.environ.get("CORS_ORIGINS", "*").split(",")
# allow_credentials=True est incompatible avec "*" (rejet navigateur) :
# credentials seulement si origines explicites.
_use_credentials = cors_origins != ["*"]
app.add_middleware(
    CORSMiddleware,
    allow_origins=cors_origins if _use_credentials else ["*"],
    allow_credentials=_use_credentials,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ----------------- Models -----------------

class DirectLoginRequest(BaseModel):
    url: str
    username: str
    password: str
    ent: Optional[str] = None
    account_type: str = "eleve" # "eleve" or "parent" (vie-scolaire explicit unsupported, see init_client)
    account_pin: Optional[str] = None
    client_identifier: Optional[str] = None
    device_name: Optional[str] = None

class QrCodeLoginRequest(BaseModel):
    qr_data: Any # JSON dict or string
    pin: str
    uuid: str
    account_type: str = "eleve"
    account_pin: Optional[str] = None
    client_identifier: Optional[str] = None
    device_name: Optional[str] = None
    skip_2fa: bool = False

class TokenLoginRequest(BaseModel):
    url: str
    username: str
    token: str
    uuid: str
    account_type: str = "eleve"
    account_pin: Optional[str] = None
    client_identifier: Optional[str] = None
    device_name: Optional[str] = None

class QrCodeRequestData(BaseModel):
    pin: str
    child_name: Optional[str] = None

class HomeworkDoneRequest(BaseModel):
    homework_id: str
    done: bool
    child_name: Optional[str] = None
    due_date: Optional[str] = None  # indice YYYY-MM-DD pour recherche ±7j d'abord

class SendMessageRequest(BaseModel):
    chat_id: str
    content: str
    child_name: Optional[str] = None
    message_id: Optional[str] = None  # reply to a specific message (Message.reply), else Discussion.reply

class ChatMarkRequest(BaseModel):
    chat_id: str
    read: bool = True
    child_name: Optional[str] = None

class ChatDeleteRequest(BaseModel):
    chat_id: str
    child_name: Optional[str] = None

class CreateChatRequest(BaseModel):
    subject: str
    content: str
    recipient_ids: List[str]
    child_name: Optional[str] = None

class NewsReadRequest(BaseModel):
    news_id: str
    child_name: Optional[str] = None

class SetChildRequest(BaseModel):
    child_name: str

class FileDownloadRequest(BaseModel):
    file_url: Optional[str] = None
    file_name: Optional[str] = None
    child_name: Optional[str] = None
    due_date: Optional[str] = None  # indice YYYY-MM-DD : scan ±7j d'abord

# ----------------- Helper Functions -----------------

def get_session_header(x_pronote_auth: Optional[str] = Header(None)) -> Dict[str, Any]:
    if not x_pronote_auth:
        raise HTTPException(status_code=401, detail="Header X-Pronote-Auth requis")
    try:
        decoded = base64.b64decode(x_pronote_auth).decode("utf-8")
        auth_data = json.loads(decoded)
        return auth_data
    except Exception as e:
        raise HTTPException(status_code=401, detail=f"Header X-Pronote-Auth invalide: {str(e)}")

def _classify_pronote_error(e: Exception) -> HTTPException:
    """Mappe les 13 exceptions pronotepy vers des HTTP précis — jamais de 401 générique."""
    tname = type(e).__name__
    msg = str(e)
    low = msg.lower()
    # --- pronotepy typed errors first (exact match, robust to message wording) ---
    if tname == "QRCodeDecryptError" or "invalid confirmation code" in low:
        return HTTPException(status_code=401, detail=f"Code PIN incorrect (QR indéchiffrable): {msg}")
    if tname == "MFAError" or "doubleauth" in low or "2fa" in low or "pin is required" in low or "invalid pin" in low:
        return HTTPException(status_code=428, detail=f"Double authentification requise (code PIN / appareil à valider): {msg}")
    if tname == "ChildNotFound" or "child" in tname.lower() and "not found" in low:
        return HTTPException(status_code=404, detail=f"Enfant introuvable: {msg}")
    if tname == "ExpiredObject" or "unknown object reference" in low or "error 22" in low:
        return HTTPException(status_code=409, detail=f"Objet Pronote expiré (session renouvelée, rouvrez la liste): {msg}")
    if tname == "DiscussionClosed":
        return HTTPException(status_code=403, detail=f"Discussion fermée, réponse impossible: {msg}")
    if tname == "UnsupportedOperation":
        return HTTPException(status_code=501, detail=f"Fonction non supportée par cet établissement: {msg}")
    if tname == "ENTLoginError":
        return HTTPException(status_code=502, detail=f"Échec de connexion ENT: {msg}")
    if tname in ("ParsingError", "DateParsingError", "ICalExportError"):
        return HTTPException(status_code=502, detail=f"Réponse Pronote inattendue ({tname}): {msg}")
    if tname == "CryptoError":
        return HTTPException(status_code=401, detail=f"Identifiants incorrects (échec chiffrement): {msg}")
    if any(k in low for k in ("429", "too many", "trop de requ", "rate limit", "rate-limit", "ratelimit")):
        return HTTPException(status_code=429, detail=f"Pronote surchargé, réessayez dans un instant: {msg}")
    if any(k in low for k in ("timeout", "timed out", "délai", "connectionerror", "connection error", "max retries", "temporarily", "temporaire", "503", "502", "504", "bad gateway", "service unavailable")):
        return HTTPException(status_code=504, detail=f"Établissement injoignable pour le moment: {msg}")
    return HTTPException(status_code=401, detail=f"Erreur d'initialisation Pronote: {msg}")


# pronotepy Util.grade_translate parity — must stay in sync with pronotepy/dataClasses.py
GRADE_TRANSLATE = [
    "Absent",
    "Dispense",
    "NonNote",
    "Inapte",
    "NonRendu",
    "AbsentZero",
    "NonRenduZero",
    "Felicitations",
]

def grade_parse(raw: Any) -> tuple:
    """Retourne (float_value|None, status_code|None, raw_str). Parité Util.grade_parse."""
    if raw is None:
        return None, None, ""
    s = str(raw).strip()
    if not s:
        return None, None, s
    if "|" in s:
        try:
            idx = int(s[1]) - 1
            if 0 <= idx < len(GRADE_TRANSLATE):
                return None, GRADE_TRANSLATE[idx], s
        except Exception:
            pass
        return None, "NonNote", s
    try:
        return float(s.replace(",", ".")), None, s
    except Exception:
        return None, s or "NonNote", s


def _serialize_attachment(f: Any) -> Dict[str, Any]:
    return {
        "id": getattr(f, "id", None),
        "name": getattr(f, "name", "Fichier"),
        "url": getattr(f, "url", None),
        "type": getattr(f, "type", 1),
    }


def init_client(auth: Dict[str, Any], child_name: Optional[str] = None):
    import pronotepy  # lazy : cold start
    account_type = str(auth.get("account_type", "eleve")).lower()
    if account_type in ("vie-scolaire", "viescolaire", "vie_scolaire", "staff", "professeur", "teacher"):
        raise HTTPException(
            status_code=501,
            detail="Comptes Vie Scolaire / Professeur non supportés par Aether (élève et parent uniquement).",
        )
    is_parent = account_type == "parent"
    ClientClass = pronotepy.ParentClient if is_parent else pronotepy.Client
    # MFA / device identity (parité pronotepy ClientBase): jamais loggés, juste forwardés.
    _account_pin = auth.get("account_pin") or None
    _client_id = auth.get("client_identifier") or None
    _device_name = auth.get("device_name") or None

    try:
        if "token" in auth and "uuid" in auth:
            client = ClientClass.token_login(
                auth["url"],
                auth["username"],
                auth["token"],
                auth["uuid"],
                account_pin=_account_pin,
                client_identifier=_client_id,
                device_name=_device_name,
            )
        elif "username" in auth and "password" in auth:
            ent = getattr(pronotepy.ent, auth["ent"]) if auth.get("ent") and hasattr(pronotepy.ent, auth["ent"]) else None
            client = ClientClass(
                auth["url"],
                username=auth["username"],
                password=auth["password"],
                ent=ent,
                account_pin=_account_pin,
                client_identifier=_client_id,
                device_name=_device_name,
            )
        else:
            raise HTTPException(status_code=401, detail="Données d'authentification incomplètes")

        if is_parent and child_name and hasattr(client, "set_child"):
            import unicodedata

            def _norm_child(s: Any) -> str:
                s = unicodedata.normalize("NFD", str(s or ""))
                s = "".join(ch for ch in s if unicodedata.category(ch) != "Mn")
                return " ".join(s.lower().split())

            wanted = _norm_child(child_name)
            candidates = []
            if hasattr(client, "children") and client.children:
                candidates = [getattr(c, "name", "") for c in client.children]
                # 1) match normalisé exact
                target_child = next(
                    (c for c in client.children if _norm_child(getattr(c, "name", "")) == wanted),
                    None,
                )
                # 2) un seul enfant → lui, quoi qu'il arrive
                if target_child is None and len(client.children) == 1:
                    target_child = client.children[0]
                # 3) match insensible à l'ordre ("DUPONT Enzo" == "Enzo DUPONT")
                if target_child is None:
                    wanted_tokens = set(wanted.split())
                    if wanted_tokens:
                        for c in client.children:
                            if set(_norm_child(getattr(c, "name", "")).split()) == wanted_tokens:
                                target_child = c
                                break
                # 4) inclusion non ambiguë (un seul candidat contient tous les tokens)
                if target_child is None:
                    wanted_tokens = set(wanted.split())
                    if wanted_tokens:
                        hits = [
                            c for c in client.children
                            if wanted_tokens <= set(_norm_child(getattr(c, "name", "")).split())
                        ]
                        if len(hits) == 1:
                            target_child = hits[0]
                if target_child:
                    client.set_child(target_child)
                    logger.info(f"[init_client] child requested={child_name!r} matched={getattr(target_child, 'name', '')!r}")
                else:
                    raise HTTPException(
                        status_code=404,
                        detail=f"[auth] Enfant « {child_name} » introuvable sur ce compte parent (enfants : {', '.join(candidates) or 'aucun'}). Rouvre la liste des enfants.",
                    )
            else:
                client.set_child(child_name)

        return client
    except HTTPException:
        raise
    except Exception as e:
        raise _classify_pronote_error(e)

# ----------------- Endpoints -----------------

@app.get("/")
def read_root():
    return {
        "status": "online",
        "service": "Aether Pronotepy Bridge",
        "version": "1.1.0",
        "redis_cached": redis_client is not None
    }


@app.get("/health")
def health():
    """Phase 6 quick win: healthcheck simple pour Vercel/uptime (single-file, pas de router)."""
    return {"status": "ok", "redis": redis_client is not None}

@app.post("/auth/login")
def login_direct(req: DirectLoginRequest):
    import pronotepy  # lazy : cold start
    if req.account_type.lower() in ("vie-scolaire", "viescolaire", "vie_scolaire", "staff", "professeur", "teacher"):
        raise HTTPException(status_code=501, detail="Comptes Vie Scolaire / Professeur non supportés (élève et parent uniquement).")
    # Compte explicite prioritaire, URL en indice secondaire (parité init_client).
    if req.account_type.lower() in ("eleve", "parent"):
        is_parent = req.account_type.lower() == "parent"
    else:
        is_parent = "parent" in req.url.lower()
    ClientClass = pronotepy.ParentClient if is_parent else pronotepy.Client

    ent = getattr(pronotepy.ent, req.ent) if req.ent and hasattr(pronotepy.ent, req.ent) else None
    if req.ent and ent is None:
        raise HTTPException(status_code=400, detail=f"ENT « {req.ent} » inconnu de pronotepy. Vérifiez le nom (voir /meta/ents).")
    client = None
    try:
        client = ClientClass(
            req.url,
            username=req.username,
            password=req.password,
            ent=ent,
            account_pin=req.account_pin,
            client_identifier=req.client_identifier,
            device_name=req.device_name,
        )
    except Exception as e:
        # MFA → remonte 428 directement, pas de fallback aveugle.
        if type(e).__name__ == "MFAError":
            raise _classify_pronote_error(e)
        AltClass = pronotepy.Client if is_parent else pronotepy.ParentClient
        try:
            client = AltClass(
                req.url,
                username=req.username,
                password=req.password,
                ent=ent,
                account_pin=req.account_pin,
                client_identifier=req.client_identifier,
                device_name=req.device_name,
            )
            is_parent = not is_parent
        except Exception as e2:
            raise _classify_pronote_error(e2)

    if not client or not client.logged_in:
        raise HTTPException(status_code=401, detail="Identifiants incorrects ou établissement injoignable")

    final_account_type = "parent" if is_parent else "eleve"
    user_info = {
        "name": getattr(client.info, "name", req.username),
        "class_name": getattr(client.info, "class_name", ""),
        "establishment": getattr(client.info, "establishment", ""),
        "account_type": final_account_type,
    }

    children = []
    if is_parent and hasattr(client, "children"):
        children = [
            {"id": getattr(c, "id", c.name), "name": c.name, "grade": getattr(c, "grade", getattr(c, "class_name", ""))}
            for c in client.children
        ]

    auth_payload = {
        "url": req.url,
        "username": req.username,
        "password": req.password,
        "ent": req.ent,
        "account_type": final_account_type,
    }
    if req.account_pin:
        auth_payload["account_pin"] = req.account_pin
    if getattr(client, "client_identifier", None):
        auth_payload["client_identifier"] = getattr(client, "client_identifier")
    if req.device_name:
        auth_payload["device_name"] = req.device_name
    encoded_token = base64.b64encode(json.dumps(auth_payload).encode("utf-8")).decode("utf-8")

    out: Dict[str, Any] = {
        "success": True,
        "user": user_info,
        "children": children,
        "auth_token": encoded_token,
    }
    if getattr(client, "client_identifier", None):
        out["client_identifier"] = getattr(client, "client_identifier")
    return out

@app.post("/auth/qrcode")
def login_qrcode(req: QrCodeLoginRequest):
    import pronotepy  # lazy : cold start
    try:
        qr_dict = req.qr_data if isinstance(req.qr_data, dict) else json.loads(req.qr_data)
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Données QR Code invalides: {str(e)}")
    if not all(k in qr_dict for k in ("login", "jeton", "url")):
        raise HTTPException(status_code=400, detail="QR Code incomplet (attendu: login, jeton, url). Scannez le QR « Application mobile » de Pronote.")

    qr_url = str(qr_dict.get("url", "")).lower()
    if req.account_type.lower() in ("eleve", "parent"):
        is_parent = req.account_type.lower() == "parent"
    else:
        is_parent = "parent" in qr_url
    ClientClass = pronotepy.ParentClient if is_parent else pronotepy.Client

    def _do_qr(cls):
        return cls.qrcode_login(
            qr_dict, req.pin, req.uuid,
            account_pin=req.account_pin,
            client_identifier=req.client_identifier,
            device_name=req.device_name,
            skip_2fa=req.skip_2fa,
        )

    client = None
    last_error: Optional[str] = None
    last_exc: Optional[Exception] = None
    try:
        client = _do_qr(ClientClass)
    except Exception as e:
        last_error = f"{type(e).__name__}: {str(e)}"
        last_exc = e
        if type(e).__name__ in ("QRCodeDecryptError", "MFAError"):
            raise _classify_pronote_error(e)
        AltClass = pronotepy.Client if is_parent else pronotepy.ParentClient
        try:
            client = _do_qr(AltClass)
            is_parent = not is_parent
        except Exception as e2:
            last_error = f"{type(e2).__name__}: {str(e2)}"
            last_exc = e2
            if type(e2).__name__ in ("QRCodeDecryptError", "MFAError"):
                raise _classify_pronote_error(e2)
            client = None
    if client is None:
        # 'dataSec' manquant = handshake refusé par Pronote : PIN incorrect,
        # QR expiré/déjà utilisé, ou protocole inattendu. Log serveur pour diag.
        logger.warning(f"[auth/qrcode] handshake failed uuid={req.uuid} error={last_error}")
        if last_exc is not None:
            # Garde le mapping précis quand disponible (CryptoError→401 etc.)
            try:
                raise _classify_pronote_error(last_exc)
            except HTTPException as he:
                if he.status_code in (428, 404, 409, 501, 502):
                    raise he
        raise HTTPException(
            status_code=401,
            detail="Code PIN incorrect ou QR Code expiré ou déjà utilisé. Génère un nouveau QR Code dans Pronote puis réessaie.",
        )

    if not client or not client.logged_in:
        raise HTTPException(status_code=401, detail="Code PIN ou QR Code expiré")

    final_account_type = "parent" if is_parent else "eleve"
    user_info = {
        "name": getattr(client.info, "name", ""),
        "class_name": getattr(client.info, "class_name", ""),
        "establishment": getattr(client.info, "establishment", ""),
        "account_type": final_account_type,
    }

    children = []
    if is_parent and hasattr(client, "children"):
        children = [
            {"id": getattr(c, "id", c.name), "name": c.name, "grade": getattr(c, "grade", getattr(c, "class_name", ""))}
            for c in client.children
        ]

    new_token = getattr(client, "password", "")
    auth_payload = {
        "url": getattr(client, "pronote_url", ""),
        "username": getattr(client, "username", ""),
        "token": new_token,
        "uuid": req.uuid,
        "account_type": final_account_type,
    }
    if getattr(client, "client_identifier", None):
        auth_payload["client_identifier"] = getattr(client, "client_identifier")
    if req.device_name:
        auth_payload["device_name"] = req.device_name
    encoded_token = base64.b64encode(json.dumps(auth_payload).encode("utf-8")).decode("utf-8")

    return {
        "success": True,
        "user": user_info,
        "children": children,
        "auth_token": encoded_token,
        "credentials": auth_payload,
        "client_identifier": getattr(client, "client_identifier", None),
    }

@app.post("/auth/token")
def login_token(req: TokenLoginRequest):
    import pronotepy  # lazy : cold start
    if req.account_type.lower() in ("eleve", "parent"):
        is_parent = req.account_type.lower() == "parent"
    else:
        is_parent = "parent" in req.url.lower()
    ClientClass = pronotepy.ParentClient if is_parent else pronotepy.Client

    def _do_token(cls):
        return cls.token_login(
            req.url, req.username, req.token, req.uuid,
            account_pin=req.account_pin,
            client_identifier=req.client_identifier,
            device_name=req.device_name,
        )

    client = None
    try:
        client = _do_token(ClientClass)
    except Exception as e:
        if type(e).__name__ == "MFAError":
            raise _classify_pronote_error(e)
        AltClass = pronotepy.Client if is_parent else pronotepy.ParentClient
        try:
            client = _do_token(AltClass)
            is_parent = not is_parent
        except Exception as e2:
            raise _classify_pronote_error(e2)

    if not client or not client.logged_in:
        raise HTTPException(status_code=401, detail="Token expiré ou révoqué")

    final_account_type = "parent" if is_parent else "eleve"
    user_info = {
        "name": getattr(client.info, "name", ""),
        "class_name": getattr(client.info, "class_name", ""),
        "establishment": getattr(client.info, "establishment", ""),
        "account_type": final_account_type,
    }

    children = []
    if is_parent and hasattr(client, "children"):
        children = [
            {"id": getattr(c, "id", c.name), "name": c.name, "grade": getattr(c, "grade", getattr(c, "class_name", ""))}
            for c in client.children
        ]

    new_token = getattr(client, "password", req.token)
    auth_payload = {
        "url": req.url,
        "username": req.username,
        "token": new_token,
        "uuid": req.uuid,
        "account_type": final_account_type,
    }
    if getattr(client, "client_identifier", None):
        auth_payload["client_identifier"] = getattr(client, "client_identifier")
    if req.device_name:
        auth_payload["device_name"] = req.device_name
    encoded_token = base64.b64encode(json.dumps(auth_payload).encode("utf-8")).decode("utf-8")

    return {
        "success": True,
        "user": user_info,
        "children": children,
        "auth_token": encoded_token,
        "credentials": auth_payload,
        "client_identifier": getattr(client, "client_identifier", None),
    }


@app.post("/auth/request-qr")
def request_qr_code(req: QrCodeRequestData, auth: Dict[str, Any] = Depends(get_session_header)):
    """Génère un nouveau QR de connexion via pronotepy request_qr_code_data(pin)."""
    if not req.pin or len(str(req.pin)) != 4 or not str(req.pin).isdigit():
        raise HTTPException(status_code=422, detail="PIN à 4 chiffres requis pour générer un QR Code.")
    client = init_client(auth, child_name=req.child_name)
    try:
        data = client.request_qr_code_data(str(req.pin))
        return {"qr": data}
    except Exception as e:
        raise _classify_pronote_error(e)


@app.get("/periods/current")
def get_current_period(
    child: Optional[str] = Query(None),
    auth: Dict[str, Any] = Depends(get_session_header),
):
    """Période courante pronotepy (onglet G==198, fallback premier onglet) — parité Client.current_period."""
    key = _cache_key("current_period", auth, child)
    hit = cache_get(key)
    if hit is not None:
        return hit
    client = init_client(auth, child_name=child)
    try:
        current = client.current_period
        payload = {
            "period": {
                "id": getattr(current, "id", current.name),
                "name": current.name,
                "start": current.start.isoformat() if hasattr(current, "start") and current.start else None,
                "end": current.end.isoformat() if hasattr(current, "end") and current.end else None,
            }
        }
    except Exception as e:
        raise _classify_pronote_error(e)
    cache_set(key, payload, 300)
    return payload


@app.get("/meta")
def get_meta(
    child: Optional[str] = Query(None),
    auth: Optional[Dict[str, Any]] = None,
):
    """Métadonnées non-authentifiées + (si header fourni) start_day/week pronotepy."""
    import pronotepy as _pn
    ents: List[str] = []
    try:
        ents = sorted([n for n in dir(_pn.ent) if not n.startswith("_")])
    except Exception:
        ents = []
    out: Dict[str, Any] = {
        "pronotepy_version": getattr(_pn, "__version__", "2.15.7"),
        "grade_translate": GRADE_TRANSLATE,
        "ents": ents,
        "supported_account_types": ["eleve", "parent"],
    }
    return out


@app.get("/meta/ents")
def list_ents():
    import pronotepy as _pn
    try:
        return {"ents": sorted([n for n in dir(_pn.ent) if not n.startswith("_")])}
    except Exception as e:
        raise HTTPException(status_code=502, detail=f"Liste ENT indisponible: {e}")


@app.get("/session/info")
def get_session_info(
    child: Optional[str] = Query(None),
    auth: Dict[str, Any] = Depends(get_session_header),
):
    """start_day/week/periods — parité ClientBase (utile au rattachement heure murale)."""
    client = init_client(auth, child_name=child)
    try:
        return {
            "start_day": client.start_day.isoformat() if hasattr(client.start_day, "isoformat") else str(client.start_day),
            "week": getattr(client, "week", None),
            "logged_in": bool(getattr(client, "logged_in", False)),
            "last_connection": client.last_connection.isoformat() if getattr(client, "last_connection", None) else None,
        }
    except Exception as e:
        raise _classify_pronote_error(e)


@app.get("/parent/children")
def get_parent_children(auth: Dict[str, Any] = Depends(get_session_header)):
    client = init_client(auth)
    if not hasattr(client, "children"):
        return {"children": []}
    return {
        "children": [
            {"id": getattr(c, "id", c.name), "name": c.name, "grade": getattr(c, "grade", getattr(c, "class_name", ""))}
            for c in client.children
        ]
    }

@app.get("/timetable")
def get_timetable(
    response: Response,
    from_date: str = Query(..., description="Date début YYYY-MM-DD"),
    to_date: str = Query(..., description="Date fin YYYY-MM-DD"),
    child: Optional[str] = Query(None),
    auth: Dict[str, Any] = Depends(get_session_header)
):
    start_d, end_d = clamp_window(parse_ymd(from_date, "from_date"), parse_ymd(to_date, "to_date"))
    key = _cache_key("timetable", auth, from_date, to_date, child)
    hit = cache_get(key)
    if hit is not None:
        _set_cache_header(response, True)
        return hit
    client = init_client(auth, child_name=child)

    lessons = client.lessons(start_d, end_d)
    result = []
    for l in lessons:
        status_str = None
        if getattr(l, "canceled", False):
            status_str = "CANCELED"
        elif getattr(l, "status", None):
            status_str = str(l.status)

        teacher = getattr(l, "teacher_name", "") or ""
        if not teacher:
            try:
                names = getattr(l, "teacher_names", None) or []
                if names:
                    teacher = ", ".join(str(n) for n in names)
            except Exception:
                pass
        if not teacher and hasattr(l, "teachers") and getattr(l, "teachers", None):
            try:
                teacher = ", ".join(getattr(t, "name", str(t)) for t in l.teachers)
            except Exception:
                pass

        room = getattr(l, "classroom", "") or ""
        if not room:
            try:
                rooms = getattr(l, "classrooms", None) or []
                if rooms:
                    room = ", ".join(str(n) for n in rooms)
            except Exception:
                pass
        if not room and hasattr(l, "classrooms") and getattr(l, "classrooms", None):
            try:
                val = getattr(l, "classrooms", None)
                if isinstance(val, list) and val and not isinstance(val[0], str):
                    room = ", ".join(getattr(c, "name", str(c)) for c in val)
            except Exception:
                pass

        group = getattr(l, "group_name", "") or ""
        if not group:
            try:
                gnames = getattr(l, "group_names", None) or []
                if gnames:
                    group = ", ".join(str(n) for n in gnames)
            except Exception:
                pass

        end_time = getattr(l, "end", None)
        end_iso = end_time.isoformat() if end_time else (l.start + timedelta(hours=1)).isoformat()

        # NOTE (pronotepy 2.x) : `Lesson.content` est un objet UNIQUE
        # `LessonContent | None` (pas une liste) ET chaque accès déclenche
        # une requête `PageCahierDeTexte` dédiée. L'appeler ici pour ~30
        # cours = ~30 POSTs supplémentaires -> timeout Vercel (EDT vide).
        # L'EDT reste donc volontairement SANS contenu (rapide) ; le
        # contenu se récupère à la demande via POST /timetable/lesson-content
        # (1 seul PageCahierDeTexte par semaine) et via /files/download.
        lesson_id = getattr(l, "id", f"{l.start}_{getattr(l.subject, 'name', '')}")

        result.append({
            "id": lesson_id,
            "resource_id": lesson_id,
            "subject": getattr(l.subject, "name", "Matière") if hasattr(l, "subject") and l.subject else "Matière",
            "subject_id": getattr(l.subject, "id", None) if hasattr(l, "subject") and l.subject else None,
            "subject_groups": bool(getattr(l.subject, "groups", False)) if hasattr(l, "subject") and l.subject else False,
            "teacher": teacher,
            "teacher_names": list(getattr(l, "teacher_names", None) or []),
            "room": room,
            "classrooms": list(getattr(l, "classrooms", None) or []),
            "group": group,
            "group_names": list(getattr(l, "group_names", None) or []),
            "start": l.start.isoformat(),
            "end": end_iso,
            "canceled": getattr(l, "canceled", False),
            "status": status_str,
            "num": getattr(l, "num", 0),
            "normal": bool(not getattr(l, "detention", False) and not getattr(l, "outing", False)),
            "color": getattr(l.subject, "color", None) if hasattr(l, "subject") and l.subject else None,
            "background_color": getattr(l, "background_color", None),
            "memo": getattr(l, "memo", None),
            "is_outing": getattr(l, "outing", False),
            "outing": getattr(l, "outing", False),
            "is_detention": getattr(l, "detention", False),
            "detention": getattr(l, "detention", False),
            "is_test": getattr(l, "test", False),
            "test": getattr(l, "test", False),
            "exempted": getattr(l, "exempted", False),
            "virtual_classrooms": getattr(l, "virtual_classrooms", []) or [],
            # Contenu rempli à la demande (voir /timetable/lesson-content).
            "content": [],
        })

    payload = {"lessons": result}
    cache_set(key, payload, 60)
    _set_cache_header(response, False)
    return payload


class LessonContentRequest(BaseModel):
    lesson_id: Optional[str] = None
    lesson_start: Optional[str] = None  # ISO datetime du début du cours
    subject: Optional[str] = None
    child_name: Optional[str] = None
    date: Optional[str] = None  # YYYY-MM-DD (semaine à scanner si lesson_start absent)


def _serialize_lesson_content(c) -> Dict[str, Any]:
    files = []
    try:
        raw_files = getattr(c, "files", None) or []
        if callable(raw_files):
            raw_files = raw_files()
        for f in (raw_files or []):
            files.append(_serialize_attachment(f))
    except Exception:
        pass
    return {
        "title": getattr(c, "title", None),
        "description": getattr(c, "description", None),
        "category": getattr(c, "category", None),
        "files": files,
    }


def _fetch_contents_for_school_week(client, week: int) -> Dict[str, Any]:
    """Un seul PageCahierDeTexte par semaine scolaire -> map lesson_id -> content brut."""
    try:
        resp = client.post("PageCahierDeTexte", 89, {"domaine": {"_T": 8, "V": f"[{week}..{week}]"}})
        items = resp.get("dataSec", {}).get("data", {}).get("ListeCahierDeTextes", {}).get("V", []) or []
        out: Dict[str, Any] = {}
        for entry in items:
            try:
                lid = ((entry.get("cours") or {}).get("V") or {}).get("N")
                conts = ((entry.get("listeContenus") or {}).get("V") or [])
                if lid and conts:
                    out[str(lid)] = conts[0]
            except Exception:
                continue
        return out
    except Exception:
        return {}


@app.post("/timetable/lesson-content")
def get_lesson_content(
    req: LessonContentRequest,
    auth: Dict[str, Any] = Depends(get_session_header)
):
    """Contenu + ressources d'un cours précis (cahier de textes).

    pronotepy `Lesson.content` = UN objet (pas une liste) + 1 requête
    réseau par accès. On mutualise : 1 seul `PageCahierDeTexte` pour la
    semaine scolaire du cours, puis mapping par lesson_id (ou fallback
    par date/heure + matière, les ids Pronote tournant à chaque session).
    """
    client = init_client(auth, child_name=req.child_name)

    # Résout la date pivot (semaine scolaire) : lesson_start > date > aujourd'hui.
    # Le frontend envoie l'heure MURALE locale (sans offset, ex. "2026-09-12T08:00:00")
    # car pronotepy expose des datetimes naïfs en heure de l'établissement.
    # Compat : les anciens clients envoyaient de l'UTC ("...Z") -> on teste les
    # deux interprétations (UTC brut + mur Paris) pour le matching ci-dessous.
    pivot: Optional[datetime] = None
    pivot_paris_wall: Optional[datetime] = None
    if req.lesson_start:
        try:
            raw_ls = str(req.lesson_start)
            if raw_ls.endswith("Z") or ("+" in raw_ls[10:] or raw_ls[10:].count("-") > 2):
                aware = datetime.fromisoformat(raw_ls.replace("Z", "+00:00"))
                if aware.tzinfo is not None:
                    pivot = aware.replace(tzinfo=None)
                    try:
                        from zoneinfo import ZoneInfo
                        pivot_paris_wall = aware.astimezone(ZoneInfo("Europe/Paris")).replace(tzinfo=None)
                    except Exception:
                        pivot_paris_wall = None
                else:
                    pivot = aware
            else:
                pivot = datetime.fromisoformat(raw_ls)
        except Exception:
            pivot = None
    anchor_d: Optional[date] = None
    if pivot is not None:
        anchor_d = pivot.date()
    elif req.date:
        try:
            anchor_d = parse_ymd(req.date, "date")
        except Exception:
            anchor_d = None
    if anchor_d is None:
        anchor_d = date.today()

    # Semaine(s) scolaire(s) à scanner : pivot ±1j (chevauchement week-end).
    weeks = set()
    for delta in (-1, 0, 1):
        try:
            weeks.add(client.get_week(anchor_d + timedelta(days=delta)))
        except Exception:
            pass
    if not weeks:
        return {"contents": []}

    # 1) Chemin direct par lesson_id (le plus fiable quand l'id est frais).
    if req.lesson_id:
        for w in weeks:
            raw_map = _fetch_contents_for_school_week(client, w)
            if str(req.lesson_id) in raw_map:
                try:
                    import pronotepy as _pn
                    lc = _pn.LessonContent(client, raw_map[str(req.lesson_id)])
                    return {"contents": [_serialize_lesson_content(lc)]}
                except Exception:
                    raw = raw_map[str(req.lesson_id)]
                    try:
                        files = [{"name": f.get("L", "Fichier"), "url": f.get("url"), "type": f.get("G", 1)} for f in (raw.get("ListePieceJointe", {}) or {}).get("V", [])]
                    except Exception:
                        files = []
                    return {"contents": [{
                        "title": raw.get("L"),
                        "description": raw.get("descriptif", {}).get("V") if isinstance(raw.get("descriptif"), dict) else raw.get("descriptif"),
                        "category": (raw.get("categorie", {}) or {}).get("V") if isinstance(raw.get("categorie"), dict) else raw.get("categorie"),
                        "files": files,
                    }]}

    # 2) Fallback par date/heure : retrouve le cours dans ±2j puis lit son contenu.
    try:
        lessons = client.lessons(anchor_d - timedelta(days=2), anchor_d + timedelta(days=2))
    except Exception as e:
        raise _classify_pronote_error(e)
    target = None
    # Candidats pivots : heure murale directe + (compat anciens clients UTC)
    # interprétation mur Paris. Le 1er qui matche gagne.
    pivots = [p for p in (pivot, pivot_paris_wall) if p is not None]
    if pivot is not None:
        # Match exact à la minute (tolérance 5 min : troncatures de secondes),
        # sinon matière + proximité (90 min : couvre DST et arrondis).
        for pv in pivots:
            for l in (lessons or []):
                try:
                    ls = getattr(l, "start", None)
                    if ls and abs((ls.replace(tzinfo=None) - pv).total_seconds()) < 300:
                        target = l
                        break
                except Exception:
                    continue
            if target is not None:
                break
        if target is None and req.subject:
            import unicodedata as _ud
            def _norm_subj(s):
                try:
                    s = _ud.normalize("NFD", str(s or ""))
                    s = "".join(ch for ch in s if _ud.category(ch) != "Mn")
                    import re as _re
                    return _re.sub(r"[^a-z0-9]+", " ", s.lower()).strip()
                except Exception:
                    return str(s or "").lower().strip()
            def _subj_match(want_n, got_n):
                if not want_n or not got_n:
                    return True
                if want_n in got_n or got_n in want_n:
                    return True
                import re as _re2
                w = _re2.sub(r"[^a-z0-9]", "", want_n)
                g = _re2.sub(r"[^a-z0-9]", "", got_n)
                if w and g:
                    if w == g:
                        return True
                    n = 0
                    while n < len(w) and n < len(g) and w[n] == g[n]:
                        n += 1
                    if n >= 4:
                        return True
                for a in want_n.split():
                    for b in got_n.split():
                        if len(a) >= 3 and (b.startswith(a) or a.startswith(b)):
                            return True
                return False
            want = _norm_subj(req.subject)
            for pv in pivots:
                for l in (lessons or []):
                    try:
                        ls = getattr(l, "start", None)
                        subj = getattr(getattr(l, "subject", None), "name", "") or ""
                        if ls and abs((ls.replace(tzinfo=None) - pv).total_seconds()) < 5400 and _subj_match(want, _norm_subj(subj)):
                            target = l
                            break
                    except Exception:
                        continue
                if target is not None:
                    break
    if target is None and lessons:
        # Dernier recours : cours le plus proche du pivot.
        try:
            def _dist(l):
                try:
                    return abs((getattr(l, "start").replace(tzinfo=None) - pivot).total_seconds()) if pivot else 0
                except Exception:
                    return 1e18
            target = sorted(list(lessons), key=_dist)[0]
        except Exception:
            target = None

    if target is None:
        return {"contents": []}
    try:
        c = target.content
    except Exception as e:
        raise _classify_pronote_error(e)
    if c is None:
        return {"contents": []}
    return {"contents": [_serialize_lesson_content(c)]}


@app.get("/timetable/contents")
def get_timetable_contents(
    response: Response,
    from_date: str = Query(..., description="Date début YYYY-MM-DD"),
    to_date: str = Query(..., description="Date fin YYYY-MM-DD"),
    child: Optional[str] = Query(None),
    auth: Dict[str, Any] = Depends(get_session_header)
):
    """Contenus de tous les cours d'une fenêtre (1 PageCahierDeTexte / semaine)."""
    start_d, end_d = clamp_window(parse_ymd(from_date, "from_date"), parse_ymd(to_date, "to_date"))
    key = _cache_key("timetable_contents", auth, from_date, to_date, child)
    hit = cache_get(key)
    if hit is not None:
        _set_cache_header(response, True)
        return hit
    client = init_client(auth, child_name=child)
    weeks = set()
    cur = start_d
    while cur <= end_d:
        try:
            weeks.add(client.get_week(cur))
        except Exception:
            pass
        cur += timedelta(days=1)
    by_lesson: Dict[str, Any] = {}
    for w in sorted(weeks):
        raw_map = _fetch_contents_for_school_week(client, w)
        for lid, raw in raw_map.items():
            try:
                import pronotepy as _pn
                by_lesson[str(lid)] = _serialize_lesson_content(_pn.LessonContent(client, raw))
            except Exception:
                continue
    # Les ids Pronote tournent à chaque session : le frontend ne peut pas les
    # recroiser avec son EDT. On joint donc heure de début + matière (1 seul
    # appel lessons() sur la fenêtre) pour un matching par date/matière.
    try:
        _lessons = client.lessons(start_d, end_d) or []
    except Exception:
        _lessons = []
    _meta: Dict[str, Dict[str, Any]] = {}
    for _l in _lessons:
        try:
            _lid = str(getattr(_l, "id", ""))
            _st = getattr(_l, "start", None)
            _subj = getattr(getattr(_l, "subject", None), "name", "") or ""
            if _lid:
                _meta[_lid] = {
                    "lesson_start": _st.isoformat() if _st else None,
                    "subject": _subj,
                }
        except Exception:
            continue
    payload = {"contents": [
        {"lesson_id": k, "lesson_start": _meta.get(k, {}).get("lesson_start"), "subject": _meta.get(k, {}).get("subject"), **v}
        for k, v in by_lesson.items()
    ]}
    cache_set(key, payload, 60)
    _set_cache_header(response, False)
    return payload

@app.get("/grades")
def get_grades(
    response: Response,
    period: Optional[str] = Query(None),
    child: Optional[str] = Query(None),
    auth: Dict[str, Any] = Depends(get_session_header)
):
    gkey = _cache_key("grades", auth, period, child)
    hit = cache_get(gkey)
    if hit is not None:
        _set_cache_header(response, True)
        return hit
    client = init_client(auth, child_name=child)
    periods = client.periods

    target_period = None
    if period:
        target_period = next((p for p in periods if p.name == period), None)
    if not target_period and periods:
        target_period = periods[-1] # Default to latest period

    if not target_period:
        return {"grades": [], "averages": None}

    grades_list = []
    for g in target_period.grades:
        val, status_code, raw_grade = grade_parse(getattr(g, "grade", None))
        out_of_val, out_status, raw_out = grade_parse(getattr(g, "out_of", None))
        avg_val, _, _ = grade_parse(getattr(g, "average", None))
        max_val, _, _ = grade_parse(getattr(g, "max", None))
        min_val, _, _ = grade_parse(getattr(g, "min", None))
        try:
            coef = float(str(getattr(g, "coefficient", 1.0)).replace(",", ".").strip())
        except Exception:
            coef = 1.0
        grades_list.append({
            "id": getattr(g, "id", f"{g.date}_{getattr(g.subject, 'name', '')}"),
            "subject": getattr(g.subject, "name", "Matière"),
            "subject_id": getattr(g.subject, "id", None) if hasattr(g, "subject") and g.subject else None,
            "subject_groups": bool(getattr(g.subject, "groups", False)) if hasattr(g, "subject") and g.subject else False,
            "description": getattr(g, "comment", "") or getattr(g, "description", ""),
            "comment": getattr(g, "comment", "") or "",
            "date": g.date.isoformat(),
            "value": val,
            "status_code": status_code,
            "raw_grade": raw_grade,
            "out_of": out_of_val if out_of_val is not None else 20.0,
            "raw_out_of": raw_out,
            "default_out_of": getattr(g, "default_out_of", None),
            "average": avg_val,
            "max": max_val,
            "min": min_val,
            "coefficient": coef,
            "is_bonus": bool(getattr(g, "is_bonus", False)),
            "is_optionnal": bool(getattr(g, "is_optionnal", False)),
            "is_out_of_20": bool(getattr(g, "is_out_of_20", False)),
        })

    def parse_float_safe(v):
        if v is None:
            return None
        if isinstance(v, (int, float)):
            return float(v)
        fv, _, _ = grade_parse(v)
        return fv

    subject_averages = {}
    if hasattr(target_period, "averages"):
        for avg in target_period.averages:
            s_name = getattr(avg.subject, "name", "") if hasattr(avg, "subject") else ""
            if s_name:
                stu_val, stu_status, _ = grade_parse(getattr(avg, "student", None))
                subject_averages[s_name] = {
                    "student": stu_val,
                    "student_status": stu_status,
                    "class_average": parse_float_safe(getattr(avg, "class_average", None)),
                    "max": parse_float_safe(getattr(avg, "max", None)),
                    "min": parse_float_safe(getattr(avg, "min", None)),
                    "out_of": parse_float_safe(getattr(avg, "out_of", 20.0)) or 20.0,
                    "default_out_of": getattr(avg, "default_out_of", None),
                    "background_color": getattr(avg, "background_color", None),
                    "subject_id": getattr(avg.subject, "id", None) if hasattr(avg, "subject") and avg.subject else None,
                }

    period_averages = {
        "overall": parse_float_safe(getattr(target_period, "overall_average", None)),
        "class_overall": parse_float_safe(getattr(target_period, "class_overall_average", None)),
        "subjects": subject_averages,
    }

    payload = {
        "period": target_period.name,
        "grades": grades_list,
        "averages": period_averages
    }
    cache_set(gkey, payload, 300)
    _set_cache_header(response, False)
    return payload

@app.get("/grades/periods")
def get_grade_periods(
    child: Optional[str] = Query(None),
    auth: Dict[str, Any] = Depends(get_session_header)
):
    key = _cache_key("grade_periods", auth, child)
    hit = cache_get(key)
    if hit is not None:
        return hit
    client = init_client(auth, child_name=child)
    result = []
    for p in client.periods:
        result.append({
            "id": getattr(p, "id", p.name),
            "name": p.name,
            "start": p.start.isoformat() if hasattr(p, "start") and p.start else None,
            "end": p.end.isoformat() if hasattr(p, "end") and p.end else None,
        })
    payload = {"periods": result}
    cache_set(key, payload, 300)
    return payload

@app.get("/homework")
def get_homework(
    response: Response,
    from_date: str = Query(..., description="Date début YYYY-MM-DD"),
    to_date: str = Query(..., description="Date fin YYYY-MM-DD"),
    child: Optional[str] = Query(None),
    auth: Dict[str, Any] = Depends(get_session_header)
):
    start_d, end_d = clamp_window(parse_ymd(from_date, "from_date"), parse_ymd(to_date, "to_date"))
    key = _cache_key("homework", auth, from_date, to_date, child)
    hit = cache_get(key)
    if hit is not None:
        _set_cache_header(response, True)
        return hit
    client = init_client(auth, child_name=child)

    hw_list = client.homework(start_d, end_d)
    result = []
    for h in hw_list:
        files = []
        try:
            raw_files = getattr(h, "files", None) or []
            # pronotepy: `files` est une @property -> liste d'Attachment.
            if callable(raw_files):
                raw_files = raw_files()
            for f in (raw_files or []):
                files.append(_serialize_attachment(f))
        except Exception:
            files = []

        result.append({
            "id": getattr(h, "id", f"{h.date}_{getattr(h.subject, 'name', '')}"),
            "subject": getattr(h.subject, "name", "Matière"),
            "subject_id": getattr(h.subject, "id", None) if hasattr(h, "subject") and h.subject else None,
            "description": getattr(h, "description", ""),
            "date": h.date.isoformat(),
            "done": getattr(h, "done", False),
            "background_color": getattr(h, "background_color", None),
            "files": files,
        })

    payload = {"homework": result}
    cache_set(key, payload, 60)
    _set_cache_header(response, False)
    return payload

@app.post("/homework/done")
def set_homework_done(
    req: HomeworkDoneRequest,
    auth: Dict[str, Any] = Depends(get_session_header)
):
    client = init_client(auth, child_name=req.child_name)
    wanted = str(req.homework_id)

    def _scan(start_d, end_d):
        try:
            return client.homework(start_d, end_d)
        except Exception:
            return []

    # Indice due_date d'abord (±7j), puis fenêtres élargies.
    windows = []
    if req.due_date:
        try:
            anchor = parse_ymd(req.due_date, "due_date")
            windows.append((anchor - timedelta(days=7), anchor + timedelta(days=7)))
        except HTTPException:
            pass
    today = date.today()
    windows += [
        (today - timedelta(days=15), today + timedelta(days=30)),
        (today - timedelta(days=60), today + timedelta(days=90)),
    ]
    target = None
    for start_d, end_d in windows:
        hw_list = _scan(start_d, end_d)
        target = next((h for h in hw_list if str(getattr(h, "id", None)) == wanted), None)
        if target:
            break

    if not target:
        raise HTTPException(status_code=404, detail="[homework/done] Devoir introuvable (id inconnu ou hors période ±60j). Rouvre la liste pour rafraîchir.")

    target.set_done(req.done)
    return {"success": True, "done": req.done}

@app.get("/attendance")
def get_attendance(
    response: Response,
    child: Optional[str] = Query(None),
    auth: Dict[str, Any] = Depends(get_session_header)
):
    akey = _cache_key("attendance", auth, child)
    ahit = cache_get(akey)
    if ahit is not None:
        _set_cache_header(response, True)
        return ahit
    client = init_client(auth, child_name=child)
    absences = []
    delays = []
    punishments = []

    def _parse_int_safe(v, default=0):
        try:
            if v is None:
                return default
            if isinstance(v, bool):
                return int(v)
            if isinstance(v, int):
                return v
            if isinstance(v, float):
                return int(v)
            return int(str(v).strip())
        except Exception:
            return default

    def _parse_float_safe(v, default=None):
        if v is None:
            return default
        if isinstance(v, bool):
            return float(v)
        if isinstance(v, timedelta):
            try:
                return float(v.total_seconds() / 60)
            except Exception:
                return default
        if isinstance(v, (int, float)):
            return float(v)
        try:
            return float(str(v).replace(",", ".").strip())
        except Exception:
            return default

    periods = getattr(client, "periods", [])
    if not periods and hasattr(client, "current_period") and client.current_period:
        periods = [client.current_period]

    for p in periods:
        if hasattr(p, "absences"):
            for a in p.absences:
                reason_str = ""
                if hasattr(a, "reasons"):
                    reasons = a.reasons
                    reason_str = ", ".join(reasons) if isinstance(reasons, list) else str(reasons)
                elif hasattr(a, "reason"):
                    reason_str = str(a.reason)

                absences.append({
                    "id": getattr(a, "id", str(getattr(a, "from_date", ""))),
                    "from": a.from_date.isoformat() if hasattr(a, "from_date") and a.from_date else None,
                    "to": a.to_date.isoformat() if hasattr(a, "to_date") and a.to_date else None,
                    "justified": getattr(a, "justified", False),
                    "hours": getattr(a, "hours", ""),
                    "reason": reason_str,
                    "days": _parse_int_safe(getattr(a, "days", 0), 0)
                })

        if hasattr(p, "delays"):
            for d in p.delays:
                reason_str = ""
                if hasattr(d, "reasons"):
                    reasons = d.reasons
                    reason_str = ", ".join(reasons) if isinstance(reasons, list) else str(reasons)
                elif hasattr(d, "reason"):
                    reason_str = str(d.reason)

                mins = getattr(d, "minutes", getattr(d, "duration", 0))

                delays.append({
                    "id": getattr(d, "id", str(getattr(d, "date", ""))),
                    "date": d.date.isoformat() if hasattr(d, "date") and d.date else None,
                    "duration": _parse_float_safe(mins, 0),
                    "justified": getattr(d, "justified", False),
                    "reason": reason_str,
                    "justification": getattr(d, "justification", "") or ""
                })

        if hasattr(p, "punishments"):
            for pun in p.punishments:
                # pronotepy Punishment: `given` (datetime|date), `reasons: List[str]`,
                # `nature`, `giver`, `homework`, `circumstances`, `duration: timedelta|None`.
                # (pas de champ `date` ni `reason` au singulier.)
                pun_reason = ""
                try:
                    rs = getattr(pun, "reasons", None) or []
                    if isinstance(rs, list) and rs:
                        pun_reason = ", ".join(str(r) for r in rs)
                except Exception:
                    pun_reason = ""
                if not pun_reason:
                    pun_reason = getattr(pun, "reason", "") or ""
                given = getattr(pun, "given", None)
                given_iso = None
                try:
                    if given is not None and hasattr(given, "isoformat"):
                        given_iso = given.isoformat()
                except Exception:
                    given_iso = None
                def _att_list(raw):
                    out = []
                    try:
                        for f in (raw or []):
                            out.append(_serialize_attachment(f))
                    except Exception:
                        pass
                    return out
                sched = []
                try:
                    for s in (getattr(pun, "schedule", None) or []):
                        st = getattr(s, "start", None)
                        dur = getattr(s, "duration", None)
                        try:
                            dur_min = float(dur.total_seconds() / 60) if hasattr(dur, "total_seconds") else (float(dur) if dur is not None else None)
                        except Exception:
                            dur_min = None
                        sched.append({
                            "id": getattr(s, "id", None),
                            "start": st.isoformat() if st is not None and hasattr(st, "isoformat") else None,
                            "duration_minutes": dur_min,
                        })
                except Exception:
                    sched = []
                punishments.append({
                    "id": getattr(pun, "id", str(given_iso or "")),
                    "date": given_iso,
                    "reason": pun_reason,
                    "reasons": list(getattr(pun, "reasons", None) or []),
                    "giver": getattr(pun, "giver", ""),
                    "nature": getattr(pun, "nature", ""),
                    "exclusion": bool(getattr(pun, "exclusion", False)),
                    "during_lesson": bool(getattr(pun, "during_lesson", False)),
                    "homework": getattr(pun, "homework", "") or "",
                    "homework_documents": _att_list(getattr(pun, "homework_documents", None)),
                    "circumstances": getattr(pun, "circumstances", "") or "",
                    "circumstance_documents": _att_list(getattr(pun, "circumstance_documents", None)),
                    "duration_minutes": _parse_float_safe(getattr(pun, "duration", None), None),
                    "schedulable": bool(getattr(pun, "schedulable", False)),
                    "requires_parent": getattr(pun, "requires_parent", None),
                    "schedule": sched,
                })

    apayload = {
        "absences": absences,
        "delays": delays,
        "punishments": punishments
    }
    cache_set(akey, apayload, 300)
    _set_cache_header(response, False)
    return apayload

@app.get("/news")
def get_news(
    response: Response,
    child: Optional[str] = Query(None),
    only_unread: bool = Query(False),
    date_from: Optional[str] = Query(None),
    date_to: Optional[str] = Query(None),
    auth: Dict[str, Any] = Depends(get_session_header)
):
    nkey = _cache_key("news", auth, child, only_unread, date_from, date_to)
    nhit = cache_get(nkey)
    if nhit is not None:
        _set_cache_header(response, True)
        return nhit
    client = init_client(auth, child_name=child)
    news_list = []
    if hasattr(client, "information_and_surveys"):
        try:
            items = client.information_and_surveys() if callable(client.information_and_surveys) else client.information_and_surveys
        except Exception as e:
            raise _classify_pronote_error(e)
        # Filtres côté bridge (parité information_and_surveys args).
        df = parse_ymd(date_from, "date_from").isoformat() if date_from else None
        dt = parse_ymd(date_to, "date_to").isoformat() if date_to else None
        for item in items:
            if only_unread and bool(getattr(item, "read", True)):
                continue
            start_d = getattr(item, "start_date", None) or getattr(item, "creation_date", None)
            creation_d = getattr(item, "creation_date", None)
            end_d = getattr(item, "end_date", None)
            if df and start_d and hasattr(start_d, "isoformat") and start_d.isoformat() < df:
                continue
            if dt and start_d and hasattr(start_d, "isoformat") and start_d.isoformat() >= dt:
                continue
            # pronotepy: `content` et `attachments` sont des MÉTHODES
            # (requête PageActualites par actu). `getattr(item, "content")`
            # renverrait la méthode elle-même, pas le texte !
            content_str = ""
            try:
                c = getattr(item, "content", None)
                content_str = c() if callable(c) else (str(c) if c else "")
            except Exception:
                content_str = ""
            atts = []
            try:
                a = getattr(item, "attachments", None)
                raw_atts = a() if callable(a) else (a or [])
                for f in (raw_atts or []):
                    atts.append(_serialize_attachment(f))
            except Exception:
                atts = []
            is_survey = bool(getattr(item, "survey", False))
            news_list.append({
                "id": getattr(item, "id", str(start_d or "")),
                "title": getattr(item, "title", "Actualité"),
                "author": getattr(item, "author", ""),
                "content": content_str,
                "date": start_d.isoformat() if start_d and hasattr(start_d, "isoformat") else None,
                "creation_date": creation_d.isoformat() if creation_d and hasattr(creation_d, "isoformat") else None,
                "end_date": end_d.isoformat() if end_d and hasattr(end_d, "isoformat") else None,
                "acknowledged": getattr(item, "read", True),
                "category": getattr(item, "category", "Information") or "Information",
                "survey": is_survey,
                "anonymous_response": bool(getattr(item, "anonymous_response", False)),
                "template": bool(getattr(item, "template", False)),
                "shared_template": bool(getattr(item, "shared_template", False)),
                "question": is_survey,
                "attachments": atts,
            })
    npayload = {"news": news_list}
    cache_set(nkey, npayload, 120)
    _set_cache_header(response, False)
    return npayload

@app.post("/news/read")
def mark_news_as_read(
    req: NewsReadRequest,
    auth: Dict[str, Any] = Depends(get_session_header)
):
    client = init_client(auth, child_name=req.child_name)
    if hasattr(client, "information_and_surveys"):
        items = client.information_and_surveys() if callable(client.information_and_surveys) else client.information_and_surveys
        target = next((x for x in items if getattr(x, "id", None) == req.news_id), None)
        if target and hasattr(target, "mark_as_read"):
            try:
                # pronotepy exige mark_as_read(status: bool).
                target.mark_as_read(True)
            except TypeError:
                try:
                    target.mark_as_read()
                except Exception:
                    pass
            return {"success": True}
    return {"success": True}

@app.get("/canteen")
def get_canteen(
    response: Response,
    from_date: str = Query(..., description="Date YYYY-MM-DD"),
    to_date: Optional[str] = Query(None),
    child: Optional[str] = Query(None),
    auth: Dict[str, Any] = Depends(get_session_header)
):
    # Phase 6 quick win: short cache 60s (menus change peu dans la journée).
    ckey = _cache_key("canteen", auth, from_date, to_date, child)
    chit = cache_get(ckey)
    if chit is not None:
        _set_cache_header(response, True)
        return chit
    client = init_client(auth, child_name=child)
    start_d = datetime.strptime(from_date, "%Y-%m-%d").date()
    end_d = datetime.strptime(to_date, "%Y-%m-%d").date() if to_date else start_d

    menus = []
    if hasattr(client, "menus"):
        menus_list = client.menus(start_d, end_d) if callable(client.menus) else client.menus
        for m in menus_list:
            def extract_foods(food_list):
                if not food_list:
                    return []
                res = []
                for f in food_list:
                    name = getattr(f, "name", str(f))
                    labels = [{"id": getattr(l, "id", None), "name": getattr(l, "name", str(l)), "color": getattr(l, "color", None)} for l in getattr(f, "labels", [])] if hasattr(f, "labels") else []
                    res.append({"id": getattr(f, "id", None), "name": name, "labels": labels})
                return res

            first_meal = extract_foods(getattr(m, "first_meal", []))
            main_meal = extract_foods(getattr(m, "main_meal", []))
            side_meal = extract_foods(getattr(m, "side_meal", []))
            cheese_meal = extract_foods(getattr(m, "cheese", []))
            dessert_meal = extract_foods(getattr(m, "dessert", []))
            other_meal = extract_foods(getattr(m, "other_meal", []))

            # Build both detailed categories and flat meals list for backward compatibility
            all_items = [f["name"] for f in first_meal + main_meal + side_meal + cheese_meal + dessert_meal + other_meal]
            
            structured_meal = {
                "entry": first_meal,
                "main": main_meal,
                "side": side_meal,
                "cheese": cheese_meal,
                "dessert": dessert_meal,
                "other": other_meal,
            }

            meals = []
            if getattr(m, "is_lunch", True):
                meals.append({"name": "Déjeuner", "items": all_items})
            if getattr(m, "is_dinner", False):
                meals.append({"name": "Dîner", "items": all_items})
            if not meals:
                meals.append({"name": "Repas", "items": all_items})

            menus.append({
                "id": getattr(m, "id", None),
                "name": getattr(m, "name", None),
                "date": m.date.isoformat() if hasattr(m, "date") else from_date,
                "is_lunch": getattr(m, "is_lunch", True),
                "is_dinner": getattr(m, "is_dinner", False),
                "meal": structured_meal,
                "meals": meals
            })
    cpayload = {"menus": menus}
    cache_set(ckey, cpayload, 60)
    _set_cache_header(response, False)
    return cpayload

@app.get("/chats")
def get_chats(
    response: Response,
    child: Optional[str] = Query(None),
    only_unread: bool = Query(False),
    auth: Dict[str, Any] = Depends(get_session_header)
):
    # Phase 6 quick win: short cache 30s (liste sensible, TTL court).
    lkey = _cache_key("chats", auth, child, only_unread)
    lhit = cache_get(lkey)
    if lhit is not None:
        _set_cache_header(response, True)
        return lhit
    client = init_client(auth, child_name=child)
    discussions = []
    if hasattr(client, "discussions"):
        try:
            disc_list = client.discussions(only_unread=only_unread) if callable(client.discussions) else client.discussions
            for d in disc_list:
                try:
                    msgs = getattr(d, "messages", [])
                except Exception:
                    msgs = []
                latest_date = msgs[-1].created.isoformat() if msgs and hasattr(msgs[-1], "created") else datetime.now().isoformat()
                discussions.append({
                    "id": getattr(d, "id", f"disc_{getattr(d, 'subject', '')}"),
                    "subject": getattr(d, "subject", "Discussion"),
                    "creator": getattr(d, "creator", ""),
                    "recipient": getattr(d, "recipient", ""),
                    "unread": getattr(d, "unread", 0),
                    "closed": getattr(d, "closed", False),
                    "replyable": getattr(d, "replyable", True),
                    "labels": list(getattr(d, "labels", None) or []),
                    "date": latest_date,
                })
        except Exception as e:
            raise _classify_pronote_error(e)
    chat_payload = {"chats": discussions}
    cache_set(lkey, chat_payload, 30)
    _set_cache_header(response, False)
    return chat_payload

@app.get("/chats/{chat_id}/messages")
def get_chat_messages(
    chat_id: str,
    child: Optional[str] = Query(None),
    auth: Dict[str, Any] = Depends(get_session_header)
):
    client = init_client(auth, child_name=child)
    messages = []
    if hasattr(client, "discussions"):
        try:
            disc_list = client.discussions() if callable(client.discussions) else client.discussions
            d = next((x for x in disc_list if getattr(x, "id", None) == chat_id), None)
            if d and hasattr(d, "messages"):
                for m in d.messages:
                    reply_to = getattr(m, "replying_to", None)
                    messages.append({
                        "id": getattr(m, "id", str(getattr(m, "created", ""))),
                        "author": getattr(m, "author", "") or "Moi",
                        "content": getattr(m, "content", ""),
                        "date": m.created.isoformat() if hasattr(m, "created") and m.created else datetime.now().isoformat(),
                        "seen": getattr(m, "seen", True),
                        "replying_to": getattr(reply_to, "id", None) if reply_to else None,
                    })
        except Exception as e:
            raise _classify_pronote_error(e)
    return {"messages": messages}


@app.get("/chats/{chat_id}/participants")
def get_chat_participants(
    chat_id: str,
    child: Optional[str] = Query(None),
    auth: Dict[str, Any] = Depends(get_session_header)
):
    """Parité Discussion.participants() (SaisiePublicMessage)."""
    client = init_client(auth, child_name=child)
    try:
        disc_list = client.discussions() if callable(client.discussions) else client.discussions
        d = next((x for x in disc_list if getattr(x, "id", None) == chat_id), None)
        if not d:
            raise HTTPException(status_code=404, detail="[chats] Discussion introuvable")
        parts = d.participants() if hasattr(d, "participants") and callable(d.participants) else []
        return {"participants": list(parts or [])}
    except HTTPException:
        raise
    except Exception as e:
        raise _classify_pronote_error(e)


@app.post("/chats/{chat_id}/read")
def mark_chat_read(
    chat_id: str,
    req: ChatMarkRequest,
    auth: Dict[str, Any] = Depends(get_session_header)
):
    """Parité Discussion.mark_as(read)."""
    client = init_client(auth, child_name=req.child_name)
    try:
        disc_list = client.discussions() if callable(client.discussions) else client.discussions
        d = next((x for x in disc_list if getattr(x, "id", None) == chat_id), None)
        if not d:
            raise HTTPException(status_code=404, detail="[chats] Discussion introuvable")
        if hasattr(d, "mark_as") and callable(d.mark_as):
            d.mark_as(bool(req.read))
        return {"success": True}
    except HTTPException:
        raise
    except Exception as e:
        raise _classify_pronote_error(e)


@app.post("/chats/{chat_id}/delete")
def delete_chat(
    chat_id: str,
    req: ChatDeleteRequest,
    auth: Dict[str, Any] = Depends(get_session_header)
):
    """Parité Discussion.delete() (corbeille)."""
    client = init_client(auth, child_name=req.child_name)
    try:
        disc_list = client.discussions() if callable(client.discussions) else client.discussions
        d = next((x for x in disc_list if getattr(x, "id", None) == chat_id), None)
        if not d:
            raise HTTPException(status_code=404, detail="[chats] Discussion introuvable")
        if hasattr(d, "delete") and callable(d.delete):
            d.delete()
        return {"success": True}
    except HTTPException:
        raise
    except Exception as e:
        raise _classify_pronote_error(e)

@app.post("/chats/send")
def send_chat_message(
    req: SendMessageRequest,
    auth: Dict[str, Any] = Depends(get_session_header)
):
    client = init_client(auth, child_name=req.child_name)
    if hasattr(client, "discussions"):
        try:
            disc_list = client.discussions() if callable(client.discussions) else client.discussions
            d = next((x for x in disc_list if getattr(x, "id", None) == req.chat_id), None)
            if not d:
                raise HTTPException(status_code=404, detail="[chats] Discussion introuvable")
            # Reply ciblé par message_id (Message.reply) — parité pronotepy.
            if req.message_id:
                target_msg = None
                try:
                    for m in (d.messages or []):
                        if str(getattr(m, "id", "")) == str(req.message_id):
                            target_msg = m
                            break
                except Exception:
                    target_msg = None
                if target_msg is None:
                    raise HTTPException(status_code=404, detail="[chats] Message introuvable pour réponse ciblée")
                try:
                    target_msg.reply(req.content)
                except Exception as e:
                    raise _classify_pronote_error(e)
                return {"success": True}
            try:
                if hasattr(d, "reply") and callable(d.reply):
                    d.reply(req.content)
                elif hasattr(d, "messages") and d.messages and hasattr(d.messages[-1], "reply"):
                    d.messages[-1].reply(req.content)
                else:
                    raise HTTPException(status_code=400, detail="Réponse impossible sur cette discussion")
            except HTTPException:
                raise
            except Exception as e:
                raise _classify_pronote_error(e)
            return {"success": True}
        except HTTPException:
            raise
        except Exception as e:
            raise _classify_pronote_error(e)
    raise HTTPException(status_code=400, detail="Messagerie non disponible")

@app.get("/chats/recipients")
def get_chat_recipients(
    child: Optional[str] = Query(None),
    auth: Dict[str, Any] = Depends(get_session_header)
):
    client = init_client(auth, child_name=child)
    recipients = []
    if hasattr(client, "get_recipients"):
        try:
            r_list = client.get_recipients()
            for r in r_list:
                recipients.append({
                    "id": getattr(r, "id", r.name),
                    "name": getattr(r, "name", "Destinataire"),
                    "type": getattr(r, "type", ""),
                    "email": getattr(r, "email", "") or "",
                    "functions": list(getattr(r, "functions", None) or []),
                    "with_discussion": bool(getattr(r, "with_discussion", True)),
                })
        except Exception as e:
            raise _classify_pronote_error(e)
    return {"recipients": recipients}

@app.post("/chats/new")
def create_new_chat(
    req: CreateChatRequest,
    auth: Dict[str, Any] = Depends(get_session_header)
):
    client = init_client(auth, child_name=req.child_name)
    if hasattr(client, "new_discussion") and hasattr(client, "get_recipients"):
        try:
            all_r = client.get_recipients()
            target_r = [r for r in all_r if getattr(r, "id", r.name) in req.recipient_ids]
            # pronotepy `new_discussion` renvoie None (pas d'objet).
            # On recrée puis on résout le vrai id en relistant.
            client.new_discussion(req.subject, req.content, target_r if target_r else all_r[:1])
            chat_id = f"disc_{req.subject}"
            try:
                fresh = client.discussions() if callable(client.discussions) else client.discussions
                # La discussion la plus récente avec le même objet = la nôtre.
                match = next((d for d in reversed(fresh or []) if getattr(d, "subject", "") == req.subject), None)
                if match is not None and getattr(match, "id", None):
                    chat_id = str(getattr(match, "id"))
            except Exception:
                pass
            return {
                "success": True,
                "chat_id": chat_id
            }
        except Exception as e:
            raise HTTPException(status_code=400, detail=f"Impossible d'initier la discussion: {str(e)}")
    raise HTTPException(status_code=400, detail="Fonctionnalité non supportée par cet établissement")

@app.get("/evaluations")
def get_evaluations(
    response: Response,
    period: Optional[str] = Query(None),
    child: Optional[str] = Query(None),
    auth: Dict[str, Any] = Depends(get_session_header)
):
    ekey = _cache_key("evaluations", auth, period, child)
    ehit = cache_get(ekey)
    if ehit is not None:
        _set_cache_header(response, True)
        return ehit
    client = init_client(auth, child_name=child)
    periods = getattr(client, "periods", []) or []

    target_period = None
    if period:
        target_period = next((p for p in periods if getattr(p, "name", None) == period), None)
    if not target_period and periods:
        target_period = periods[-1]

    if not target_period:
        return {"evaluations": []}

    def parse_float_safe(v, default=None):
        if v is None:
            return default
        if isinstance(v, (int, float)):
            try:
                return float(v)
            except Exception:
                return default
        try:
            return float(str(v).replace(",", ".").strip())
        except Exception:
            return default

    try:
        raw_evaluations = target_period.evaluations
    except Exception:
        raw_evaluations = []

    result = []
    for e in (raw_evaluations or []):
        e_subject = getattr(e.subject, "name", "") if hasattr(e, "subject") and getattr(e, "subject", None) else ""
        e_subject_id = getattr(e.subject, "id", None) if hasattr(e, "subject") and getattr(e, "subject", None) else None
        e_date = getattr(e, "date", None)
        try:
            date_iso = e_date.isoformat() if e_date and hasattr(e_date, "isoformat") else None
        except Exception:
            date_iso = None
        paliers = getattr(e, "paliers", []) or []
        if not isinstance(paliers, list):
            try:
                paliers = list(paliers)
            except Exception:
                paliers = []
        acquisitions = []
        for ac in (getattr(e, "acquisitions", []) or []):
            acquisitions.append({
                "id": getattr(ac, "id", None),
                "name": getattr(ac, "name", "") or "",
                "abbreviation": getattr(ac, "abbreviation", "") or "",
                "level": getattr(ac, "level", "") or "",
                "coefficient": parse_float_safe(getattr(ac, "coefficient", 1.0), 1.0),
                "domain": getattr(ac, "domain", "") or "",
                "domain_id": getattr(ac, "domain_id", None),
                "name_id": getattr(ac, "name_id", None),
                "order": getattr(ac, "order", None),
                "pillar": getattr(ac, "pillar", "") or "",
                "pillar_id": getattr(ac, "pillar_id", None),
                "pillar_prefix": getattr(ac, "pillar_prefix", None),
            })
        result.append({
            "id": getattr(e, "id", f"{getattr(e, 'name', '')}"),
            "name": getattr(e, "name", "") or "",
            "subject": e_subject or "",
            "subject_id": e_subject_id,
            "domain": getattr(e, "domain", None),
            "teacher": getattr(e, "teacher", "") or "",
            "coefficient": parse_float_safe(getattr(e, "coefficient", 1.0), 1.0),
            "description": getattr(e, "description", "") or "",
            "date": date_iso,
            "paliers": paliers,
            "acquisitions": acquisitions,
        })

    epayload = {"evaluations": result}
    cache_set(ekey, epayload, 300)
    _set_cache_header(response, False)
    return epayload

@app.get("/report")
def get_report(
    response: Response,
    period: Optional[str] = Query(None),
    child: Optional[str] = Query(None),
    auth: Dict[str, Any] = Depends(get_session_header)
):
    rkey = _cache_key("report", auth, period, child)
    rhit = cache_get(rkey)
    if rhit is not None:
        _set_cache_header(response, True)
        return rhit
    client = init_client(auth, child_name=child)
    periods = getattr(client, "periods", []) or []

    target_period = None
    if period:
        target_period = next((p for p in periods if getattr(p, "name", None) == period), None)
    if not target_period and periods:
        target_period = periods[-1]

    if not target_period:
        return {"report": None}

    try:
        r = getattr(target_period, "report", None)
    except Exception:
        r = None

    if r is None:
        return {"report": None}

    subjects = []
    for s in (getattr(r, "subjects", []) or []):
        comments = getattr(s, "comments", []) or []
        if not isinstance(comments, list):
            try:
                comments = list(comments)
            except Exception:
                comments = []
        teachers = getattr(s, "teachers", []) or []
        if not isinstance(teachers, list):
            try:
                teachers = list(teachers)
            except Exception:
                teachers = []
        subjects.append({
            "id": getattr(s, "id", None),
            "name": getattr(s, "name", "") or "",
            "color": getattr(s, "color", None),
            "comments": comments,
            "class_average": getattr(s, "class_average", None),
            "student_average": getattr(s, "student_average", None),
            "min_average": getattr(s, "min_average", None),
            "max_average": getattr(s, "max_average", None),
            "coefficient": getattr(s, "coefficient", None),
            "teachers": teachers,
        })

    top_comments = getattr(r, "comments", []) or []
    if not isinstance(top_comments, list):
        try:
            top_comments = list(top_comments)
        except Exception:
            top_comments = []

    rpayload = {"report": {"comments": top_comments, "subjects": subjects}}
    cache_set(rkey, rpayload, 300)
    _set_cache_header(response, False)
    return rpayload

@app.get("/teaching-staff")
def get_teaching_staff(
    child: Optional[str] = Query(None),
    auth: Dict[str, Any] = Depends(get_session_header)
):
    client = init_client(auth, child_name=child)
    staff = []
    try:
        if hasattr(client, "get_teaching_staff") and callable(getattr(client, "get_teaching_staff")):
            raw_staff = client.get_teaching_staff()
        else:
            raw_staff = []
    except Exception as e:
        raise _classify_pronote_error(e)

    for s in (raw_staff or []):
        subjects = getattr(s, "subjects", None) or []
        subj_list = []
        subject_str = ""
        try:
            for sub in (subjects if isinstance(subjects, list) else []):
                subj_list.append({
                    "id": getattr(sub, "id", None),
                    "name": getattr(sub, "name", "") or "",
                    "parent_subject_id": getattr(sub, "parent_subject_id", None),
                    "parent_subject_name": getattr(sub, "parent_subject_name", None),
                })
            if subj_list:
                subject_str = subj_list[0].get("name", "") or ""
        except Exception:
            subj_list = []
        staff.append({
            "id": getattr(s, "id", None),
            "name": getattr(s, "name", "") or "",
            "type": getattr(s, "type", None),
            "subject": subject_str or "",
            "subjects": subj_list,
            "email": "",
        })

    return {"staff": staff}

@app.get("/ical-url")
def get_ical_url(
    child: Optional[str] = Query(None),
    auth: Dict[str, Any] = Depends(get_session_header)
):
    client = init_client(auth, child_name=child)
    url = None
    try:
        if hasattr(client, "export_ical") and callable(getattr(client, "export_ical")):
            raw_url = client.export_ical()
            if isinstance(raw_url, str):
                url = raw_url
            elif raw_url:
                try:
                    url = str(raw_url)
                except Exception:
                    url = None
            else:
                url = None
        else:
            url = None
    except Exception:
        url = None
    return {"url": url}


@app.get("/profile")
def get_profile(
    child: Optional[str] = Query(None),
    auth: Dict[str, Any] = Depends(get_session_header)
):
    """Infos élève complètes (pronotepy ClientInfo) : nom, classe, établissement,
    adresse, email, téléphone, INE, délégué. Non-critique : champs manquants -> ""."""
    client = init_client(auth, child_name=child)
    info = getattr(client, "info", None)
    if info is None:
        return {"name": "", "class_name": "", "establishment": ""}
    def _safe(fn, default=""):
        try:
            v = fn()
            return v if v is not None else default
        except Exception:
            try:
                v = fn
                return v if isinstance(v, (str, list)) else default
            except Exception:
                return default
    try:
        address = _safe(lambda: info.address, ("", "", "", "", "", "", "", ""))
        if not isinstance(address, (list, tuple)):
            address = ("", "", "", "", "", "", "", "")
    except Exception:
        address = ("", "", "", "", "", "", "", "")
    return {
        "id": getattr(info, "id", None),
        "name": getattr(info, "name", "") or "",
        "class_name": getattr(info, "class_name", "") or "",
        "establishment": getattr(info, "establishment", "") or "",
        "address": list(address) if isinstance(address, (list, tuple)) else [],
        "email": _safe(lambda: info.email),
        "phone": _safe(lambda: info.phone),
        "ine_number": _safe(lambda: info.ine_number),
        "delegue": _safe(lambda: info.delegue, []),
        "has_profile_picture": bool(getattr(info, "profile_picture", None) is not None),
    }


@app.get("/profile/picture")
def get_profile_picture(
    child: Optional[str] = Query(None),
    auth: Dict[str, Any] = Depends(get_session_header)
):
    """Photo de profil pronotepy (ClientInfo.profile_picture Attachment → base64, max 4 Mo)."""
    client = init_client(auth, child_name=child)
    info = getattr(client, "info", None)
    if info is None:
        raise HTTPException(status_code=404, detail="Profil indisponible.")
    try:
        pic = getattr(info, "profile_picture", None)
        if pic is None:
            return {"picture": None}
        data = pic.data
        if not data:
            return {"picture": None}
        raw = bytes(data)
        if len(raw) > 4 * 1024 * 1024:
            raise HTTPException(status_code=413, detail="Photo trop volumineuse (max 4 Mo).")
        import mimetypes as _mt
        mime, _ = _mt.guess_type(getattr(pic, "name", "photo.jpg") or "photo.jpg")
        return {"picture": base64.b64encode(raw).decode("ascii"), "mime": mime or "image/jpeg", "name": getattr(pic, "name", "photo.jpg")}
    except HTTPException:
        raise
    except Exception as e:
        raise _classify_pronote_error(e)


@app.get("/timetable/pdf")
def get_timetable_pdf(
    day: Optional[str] = Query(None, description="Jour YYYY-MM-DD (semaine générée, défaut: année)"),
    portrait: bool = Query(False),
    overflow: int = Query(0, ge=0, le=2),
    child: Optional[str] = Query(None),
    auth: Dict[str, Any] = Depends(get_session_header)
):
    """URL du PDF EDT via pronotepy `generate_timetable_pdf` (parité day/portrait/overflow)."""
    client = init_client(auth, child_name=child)
    if not hasattr(client, "generate_timetable_pdf"):
        raise HTTPException(status_code=400, detail="Export PDF non supporté par ce compte.")
    try:
        d = parse_ymd(day, "day") if day else None
        url = client.generate_timetable_pdf(day=d, portrait=bool(portrait), overflow=int(overflow))
        return {"url": str(url)}
    except HTTPException:
        raise
    except Exception as e:
        raise _classify_pronote_error(e)

@app.post("/files/download")
def download_file(
    req: FileDownloadRequest,
    auth: Dict[str, Any] = Depends(get_session_header)
):
    """Télécharge un fichier Pronote (devoir ou contenu de cours) et le renvoie en base64.

    L'authentification est portée par le header X-Pronote-Auth (blob base64 JSON
    contenant url/username/token ou password/uuid/ent/account_type). Le body ne
    porte que file_url / file_name (+ child_name pour les comptes parents).

    Les URLs Pronote sont sessionnées et expirent : on recherche donc d'abord la
    pièce jointe correspondante (par nom, puis par URL) dans les devoirs et les
    contenus de cours afin d'obtenir une URL fraîche via une session authentifiée,
    avec fallback sur un GET authentifié direct de file_url.
    """
    client = init_client(auth, child_name=req.child_name)
    try:
        active_child = getattr(client, "selected_child", None) or getattr(client, "child", None)
        logger.info(f"[files/download] child requested={req.child_name!r} active={active_child!r} file={(req.file_name or '').strip()!r}")
    except Exception:
        pass

    target_url = (req.file_url or "").strip()
    target_name = (req.file_name or "").strip()
    if not target_url and not target_name:
        raise HTTPException(status_code=400, detail="file_url ou file_name requis")

    found_bytes: Optional[bytes] = None
    found_name = target_name or "fichier"

    import unicodedata
    from urllib.parse import urlsplit, parse_qsl, urlunsplit

    def _norm_name(s: str) -> str:
        s = (s or "").strip()
        s = unicodedata.normalize("NFD", s)
        s = "".join(ch for ch in s if unicodedata.category(ch) != "Mn")
        return " ".join(s.lower().split())

    def _norm_url(u: str) -> str:
        try:
            p = urlsplit((u or "").strip())
            q = [(k, v) for (k, v) in parse_qsl(p.query) if not k.lower().startswith(("sess", "token", "id"))]
            return urlunsplit((p.scheme.lower(), p.netloc.lower(), p.path.rstrip("/"), "&".join(f"{k}={v}" for k, v in q), ""))
        except Exception:
            return (u or "").strip()

    norm_target_name = _norm_name(target_name)
    norm_target_url = _norm_url(target_url)
    # 3e passage : candidats par nom seul (URL sessionnée expirée).
    name_only_candidates = []

    def _try_consume_attachment(f, name_only: bool = False) -> bool:
        nonlocal found_bytes, found_name
        try:
            fname = str(getattr(f, "name", "") or "")
            furl = str(getattr(f, "url", "") or "")
        except Exception:
            return False
        if name_only:
            if not (norm_target_name and fname and _norm_name(fname) == norm_target_name):
                return False
        else:
            name_match = bool(target_name and fname and _norm_name(fname) == norm_target_name)
            url_match = bool(target_url and furl and _norm_url(furl) == norm_target_url)
            if not (name_match or url_match):
                if norm_target_name and fname and _norm_name(fname) == norm_target_name:
                    name_only_candidates.append(f)
                return False
        if getattr(f, "type", 1) == 0:
            raise HTTPException(
                status_code=400,
                detail="Ce document est un lien externe, ouvrez-le dans le navigateur."
            )
        try:
            data = f.data
        except HTTPException:
            raise
        except Exception as e:
            raise HTTPException(
                status_code=502,
                detail=f"Échec du téléchargement du fichier Pronote: {str(e)}"
            )
        if not data:
            return False
        found_bytes = bytes(data)
        if fname:
            found_name = fname
        return True

    today = date.today()

    def _scan_homework(start_d, end_d) -> bool:
        try:
            hw_list = client.homework(start_d, end_d)
        except HTTPException:
            raise
        except Exception:
            return False
        for h in (hw_list or []):
            try:
                files = getattr(h, "files", None) or []
                if callable(files):
                    files = files()
            except Exception:
                continue
            for f in (files or []):
                if _try_consume_attachment(f):
                    return True
            if found_bytes is not None:
                return True
        return found_bytes is not None

    def _iter_contents_for_range(start_d, end_d):
        """Contenus de cours sans explosion N+1 : 1 PageCahierDeTexte / semaine scolaire."""
        weeks = set()
        cur = start_d
        # Garde-fou : ne scanne jamais plus de 22 semaines d'un coup.
        guard = 0
        while cur <= end_d and guard < 160:
            try:
                weeks.add(client.get_week(cur))
            except Exception:
                pass
            cur += timedelta(days=1)
            guard += 1
        for w in sorted(weeks):
            raw_map = _fetch_contents_for_school_week(client, w)
            for raw in (raw_map or {}).values():
                try:
                    import pronotepy as _pn
                    yield _pn.LessonContent(client, raw)
                except Exception:
                    continue

    def _scan_lessons(start_d, end_d) -> bool:
        # pronotepy `Lesson.content` = objet UNIQUE + 1 requête par accès :
        # on ne fait JAMAIS `lesson.content` en boucle (N+1 -> timeout).
        try:
            for c in _iter_contents_for_range(start_d, end_d):
                try:
                    files = getattr(c, "files", None) or []
                    if callable(files):
                        files = files()
                except Exception:
                    continue
                for f in (files or []):
                    if _try_consume_attachment(f):
                        return True
                if found_bytes is not None:
                    return True
        except HTTPException:
            raise
        except Exception:
            return False
        return found_bytes is not None

    # Phase 6: pas de lookup direct par homeworkId dans pronotepy (requiert une
    # fenêtre de dates). Le match par ID exact dans la fenêtre étroite ±7j ci-dessous
    # joue ce rôle de lookup direct — déjà OK, on garde la fenêtre étroite d'abord
    # pour éviter le scan large 150j systématique.
    # 0) Indice due_date/given_at d'abord (±7j) : évite le scan 150j systématique.
    if found_bytes is None and req.due_date:
        try:
            anchor = parse_ymd(req.due_date, "due_date")
            _scan_homework(anchor - timedelta(days=7), anchor + timedelta(days=7))
            if found_bytes is None:
                _scan_lessons(anchor - timedelta(days=7), anchor + timedelta(days=7))
        except HTTPException:
            raise
        except Exception:
            pass

    # 1) Recherche dans les devoirs (fenêtre large pour couvrir les pièces jointes expirées).
    if found_bytes is None:
        _scan_homework(today - timedelta(days=60), today + timedelta(days=90))

    # 2) Recherche dans les contenus de cours (cahier de textes).
    if found_bytes is None:
        try:
            _scan_lessons(today - timedelta(days=60), today + timedelta(days=60))
        except HTTPException:
            raise
        except Exception:
            pass

    # 2b) 3e passage : nom seul (URL sessionnée expirée / renommage query).
    if found_bytes is None and name_only_candidates:
        for f in name_only_candidates:
            try:
                if _try_consume_attachment(f, name_only=True):
                    break
            except HTTPException:
                raise
            except Exception:
                continue

    # 3) Fallback : GET authentifié direct de file_url avec les cookies de session.
    if found_bytes is None:
        if not target_url:
            detail = "[files/download] Fichier introuvable ou session Pronote expirée."
            if req.child_name:
                detail += f" (enfant : {req.child_name})"
            raise HTTPException(status_code=404, detail=detail)
        try:
            sess = getattr(getattr(client, "communication", None), "session", None)
            if sess is None:
                raise HTTPException(status_code=500, detail="Session Pronote indisponible.")
            resp = sess.get(target_url, timeout=20)
            if getattr(resp, "status_code", 500) != 200:
                raise HTTPException(
                    status_code=404,
                    detail="[files/download] Fichier introuvable ou session Pronote expirée. Rouvrez la liste pour rafraîchir."
                )
            content = getattr(resp, "content", None)
            if not content:
                raise HTTPException(status_code=404, detail="[files/download] Fichier vide ou introuvable.")
            found_bytes = bytes(content)
            if target_name:
                found_name = target_name
        except HTTPException:
            raise
        except Exception as e:
            raise HTTPException(
                status_code=502,
                detail=f"Échec du téléchargement du fichier: {str(e)}"
            )

    if not found_bytes:
        detail = "[files/download] Fichier introuvable ou session Pronote expirée. Rouvrez la liste pour rafraîchir."
        if req.child_name:
            detail += f" (enfant : {req.child_name})"
        raise HTTPException(status_code=404, detail=detail)

    # Vercel plafonne les réponses ~4.5Mo : au-delà, base64 exploserait (502
    # plateforme). 413 explicite plutôt qu'un timeout opaque.
    if len(found_bytes) > 4 * 1024 * 1024:
        raise HTTPException(status_code=413, detail="Fichier trop volumineux pour être ouvert depuis l'app (max 4 Mo).")

    mime, _ = mimetypes.guess_type(found_name)
    if not mime:
        mime = "application/octet-stream"

    return {
        "filename": found_name,
        "mime": mime,
        "base64": base64.b64encode(found_bytes).decode("ascii"),
    }
