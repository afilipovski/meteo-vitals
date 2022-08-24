export function Color(R, G, B) {
    return {
        R: R,
        G: G,
        B: B
    }
}
export function greyify(baseColor, factor) {
    let greyEquivalent = (baseColor.R + baseColor.G + baseColor.B)/3;
    factor *= 0.7;
    return {
        R: baseColor.R + factor * (greyEquivalent - baseColor.R),
        G: baseColor.G + factor * (greyEquivalent - baseColor.G),
        B: baseColor.B + factor * (greyEquivalent - baseColor.B),
    }
}
export function darken(baseColor, factor) {
    factor *= 0.6;
    return {
        R: baseColor.R * (1-factor),
        G: baseColor.G * (1-factor),
        B: baseColor.B * (1-factor)
    }
}