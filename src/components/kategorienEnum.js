export const kategorien = {
    Technik: 0,
    Kunst: 1,
    Musik: 2,
    Sport: 3,
};

export function getAllKategorien() {
    return Object.entries(kategorien).map(([name, id]) => ({
        id: id.toString(),
        name,
    }));
}

export function getKategorieNameById(id) {
    return Object.keys(kategorien).find(
        (key) => kategorien[key] === parseInt(id)
    );
}
