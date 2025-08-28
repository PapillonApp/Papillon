import { Client } from "turboself-api";
import { QRCode, QRType } from "../shared/canteen";
import { error } from "@/utils/logger/logger";

export function fetchTurboSelfQRCode(session: Client, accountId: string): QRCode {
	if (session.host?.cardNumber) {
		return {
			type: QRType.QRCode,
			data: String(session.host.cardNumber),
			createdByAccount: accountId
		};
	}
	
	error("No QRCode Found", "fetchTurboSelfQRCode")
}