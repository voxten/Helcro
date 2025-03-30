export default class Recipe {
    constructor(name, description, products, photo, categories, rating, userId, steps) {
        this.name = name;
        this.description = description;
        this.products = products; // Tablica obiektów { name, amount }
        this.photo = photo;
        this.categories = categories;
        this.rating = rating;
        this.userId = userId;
        this.steps = steps; // Nowe pole: tablica kroków przepisu
    }
}
