import { phrases } from "@/data/phrases";

export function getRandomPhrase(): string {
    const randomIndex = Math.floor(Math.random() * phrases.length);
    return phrases[randomIndex];
}