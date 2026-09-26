# Règles de contribution

## 🔐 Signaler une vulnérabilité

Nous prenons la sécurité **très au sérieux**. Si tu découvres une **vulnérabilité** dans **Papillon**, merci de suivre notre [**politique de sécurité**](https://github.com/PapillonApp/Papillon/.github/blob/main/SECURITY.md) : **n’ouvre pas d’issue publique** et signale-la directement à l’adresse suivante : <mark style="color:$danger;">**support@papillon.bzh**</mark>.

## 📤 Soumettre une Pull Request

Nous serions ravis d’intégrer tes modifications à Papillon. Cependant, avant de fusionner avec la branche principale, merci de respecter les règles ci-dessous. En cas de non-respect, ta Pull Request sera considérée comme **invalide** et ne sera pas traitée tant que les corrections nécessaires n’auront pas été apportées.

* [x] Tu ne dois pas soumettre plusieurs fonctionnalités ou corrections de bugs dans une même Pull Request. Chaque modification doit rester isolée afin de faciliter son traitement et, si nécessaire, son éventuel retour.
* [x] Si ta Pull Request concerne des changements majeurs, merci d'ouvrir une Issue pour discuter avec les mainteneurs de la stratégie à adopter pour ne pas faire de gros travaux pour rien.
* [x] Ta Pull Request doit respecter les conventions [Conventional Commits](https://www.conventionalcommits.org/en/v1.0.0/) et [Conventional Branch](https://conventional-branch.github.io/), ainsi que le style de code de l’application.
* [x] Si ta Pull Request modifie une partie documentée, comme la structure, l’architecture ou autre, assure-toi d’avoir mis à jour la documentation en conséquence.
* [x] J'ai testé mes changements sur iOS et Android et l'application compile correctement.
* [x] J'utilise un langage informel (tutoiement).

#### ❓ Comment vérifier le Lint ?

Par défaut, en effectuant la commande ci-dessous, ESLint essayera de résoudre automatiquement les problèmes, s'il n'y arrive pas, tu dois les corriger manuellement.

```bash
$ npm run lint
```

## 📥 Ouvrir une issue

Avant d’ouvrir une issue, assure-toi d’utiliser la **dernière version** de **Papillon**, teste si le problème persiste après mise à jour, et vérifie qu’une issue similaire n’a pas **déjà** été ouverte. Une issue bien écrite facilite son traitement et est toujours plus agréable pour nous à lire, afin que le traitement se passe au mieux, voici quelques conseils :

1. **Elle porte un nom explicite**, qui permet d’identifier **immédiatement** son **sujet principal**.
2. **Aucune issue semblable n’existe déjà** : il est inutile d’en créer plusieurs pour le même problème, **cela ne fait que ralentir son traitement**. Si tu es concerné par une issue existante, **réagis** simplement avec un👍
3. **Elle contient une description détaillée**, si c’est une fonctionnalité, elle est **clairement expliquée**, idéalement accompagnée d’une **capture d’écran** ou d’un **design Figma,** s’il s’agit d’un bug, la description précise **le comportement actuel**, **le comportement attendu**, ainsi que **les étapes pour le reproduire**.
4. Si tu rencontres **le même problème** ou souhaite **la même fonctionnalité**, privilégie les **réactions** aux commentaires.
5. **Compléte le modèle fourni lors de la création de ton issue**, il a été rédigé pour t'aider à **structurer ta demande, ne rien oublier d’important et gagner du temps**.