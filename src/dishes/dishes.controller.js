const e = require("express");
const path = require("path");

const { params } = require()

// Use the existing dishes data
const dishes = require(path.resolve("src/data/dishes-data"));

// Use this function to assign ID's when necessary
const nextId = require("../utils/nextId");

// TODO: Implement the /dishes handlers needed to make the tests pass

function hasName(req, res, next) {
    const { name } = req.body.data;

    if(name) {
        next();
    } else {
        next({
            status: 400,
            message: "Dish must include a name",
        });
    }
}

function hasDescription(req, res, next) {
    const { description } = req.body.data;

    if(description) {
        next();
    } else {
        next({
            status: 400,
            message: "Dish must include a description",
        })
    }
}

function priceIsNumber(req, res, next) {
    const { price } = req.body.data;

    if(Number.isInteger(price)) {
        next();
    } else {
        next({
            status: 400,
            message: "Dish price must be an integer",
        })
    }
}

function hasPrice(req, res, next) {
    const { price } = req.body.data;

    if(price) {
        next();
    } else {
        next({
            status: 400,
            message: "Dish must include a price",
        })
    }
}

function priceGreaterThanZero(req, res, next) {
    const { price } = req.body.data;

    if(price < 1) {
        next({
            status: 400,
            message: "Dish must have a price that is an integer greater than 0",
        })
    } else {
        next();
    }
}

function hasImage(req, res, next) {
    const { image_url } = req.body.data;

    if(image_url) {
        next();
    } else {
        next({
            status: 400,
            message: "Dish must include a image_url",
        });
    }
}

function create(req, res, next) {
    const newDish = req.body.data;

    newDish.id = nextId();

    dishes.push(newDish);

    res.status(201).json({ data: newDish });
}

function dishExists(req, res, next) {
    const { dishId } = req.params;
    const foundDish = dishes.find((dish) => dish.id === dishId);

    if(!foundDish) {
        next({
            status: 404,
            message: `Dish does not exist: ${dishId}.`
        });
    } else {
        res.locals.foundDish = foundDish;
        next();
    }
}

function read(req, res, next) {
    const foundDish = res.locals.foundDish;
    res.status(200).json({ data: foundDish});
}

function bodyIdMatchesRoute(req, res, next) {
    const { dishId } = req.params;
    const updatedDish = req.body.data;

    if(!updatedDish.id) {
        updatedDish.id = dishId;
        res.locals.updatedDish = updatedDish;
        next();
    }

    if(updatedDish.id == dishId) {
        res.locals.updatedDish = updatedDish;
        next();
    } else {
        next({
            status: 400,
            message: `Order id does not match route id. Order: ${updatedDish.id}, Route: ${dishId}.`,
        })
    }
}

function update(req, res, next) {
    const { dishId } = req.params;
    const updatedDish = res.locals.updatedDish;

    const dishIndex = dishes.findIndex((dish) => dish.id == dishId);
    dishes[dishIndex] = updatedDish;

    res.status(200).json({ data: updatedDish });
}

function list(req, res, next) {
    res.json({ data: dishes });
}

module.exports = {
    create: [hasName, hasDescription, hasPrice, priceIsNumber, priceGreaterThanZero, hasImage, create],
    update: [dishExists, hasName, hasDescription, hasPrice, priceIsNumber, priceGreaterThanZero, hasImage, bodyIdMatchesRoute, update],
    read: [dishExists, read],
    list,
}