import UserModel from "../model/UserModel.js";

export function getPlural(word) {
    // 🔹 Liste des pluriels irréguliers
    const irregularPlurals = {
        man: "men",
        woman: "women",
        child: "children",
        foot: "feet",
        tooth: "teeth",
        goose: "geese",
        mouse: "mice",
        person: "people",
        ox: "oxen"
    };

    // 🔹 Mots invariables (identiques au singulier et pluriel)
    const uncountableNouns = ["sheep", "fish", "deer", "species", "series", "moose"];

    // ✅ Vérifier les irréguliers
    if (irregularPlurals[word.toLowerCase()]) {
        return irregularPlurals[word.toLowerCase()];
    }

    // ✅ Vérifier les invariables
    if (uncountableNouns.includes(word.toLowerCase())) {
        return word;
    }

    // ✅ Règle: si le mot finit par "f" ou "fe" → "ves"
    if (word.match(/(f|fe)$/)) {
        return word.replace(/(f|fe)$/, "ves");
    }

    // ✅ Règle: si le mot finit par "y" et est précédé d'une consonne → "ies"
    if (word.match(/[^aeiou]y$/)) {
        return word.replace(/y$/, "ies");
    }

    // ✅ Règle: si le mot finit par "s", "x", "z", "ch", "sh" → "es"
    if (word.match(/(s|x|z|ch|sh)$/)) {
        return word + "es";
    }

    // ✅ Cas général: ajouter simplement "s"
    return word + "s";
}

export function generate(length) {
    let code = ""
    for (let i = 0; i < length; i++) {
        code += Math.floor(Math.random() * 10) // Génère un chiffre entre 0 et 9
    }
    return code
}
export const generateVerificationCode = async (length = 6, expiredMilliSeconds = (1) * 60 * 60 * 1000) => {

    let code = generate(length), bool = true

    while (bool) {
        const user = await UserModel.scope("withCode").findOne({where: {code}})
        if (user) code = generate(length)
        else bool = false
    }

    const expiredAt = new Date(Date.now() + expiredMilliSeconds)

    return {code, expiredAt}
}

export const isCodeValid = (code, user) => {
    if (user.code !== code || !user.expiredAt) return false
    const now = new Date(); // Récupère la date actuelle
    return now < user.expiredAt; // Vérifie si le code est encore valide
}

export const generateCodeRegex = (length) => {
    return new RegExp(`^\\d{${length}}$`);
}