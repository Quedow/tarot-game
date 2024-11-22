export function generatePseudo() {
    const pseudos: string[] = [
        "Rageux",
        "Chanceux",
        "Loser",
        "Tricheur",
        "T'es qui ?",
        "Chômeur",
        "La légende",
        "Fonceur",
        "Retro",
        "Le stylé",
        "Noob",
        "Killer",
        "Batman",
        "Zero"
    ];
    
    return pseudos[Math.floor(Math.random() * pseudos.length)];;
}