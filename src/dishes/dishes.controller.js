const e = require("express");
const path = require("path");

const { params } = require()

// Use the existing dishes data
const dishes = require(path.resolve("src/data/dishes-data"));

// Use this function to assign ID's when necessary
const nextId = require("../utils/nextId");

// TODO: Implement the /dishes handlers needed to make the tests pass

function initData(req, res, next) {
    //Moves the new dish's data into locals for ease of access
    res.locals.foundDish = req.body.data;
    next();
}

function hasName(req, res, next) {
    const { name } = res.locals.foundDish;

    if(name) {
        next();
        return;
    }
    next({
        status: 400,
        message: "Dish must include a name",
    });
}

function hasDescription(req, res, next) {
    const { description } = res.locals.foundDish;

    if(description) {
        next();
        return;
    }
    next({
        status: 400,
        message: "Dish must include a description",
    });
}

function priceIsNumber(req, res, next) {
    const { price } = res.locals.foundDish;

    if(Number.isInteger(price)) {
        next();
        return;
    }
    next({
        status: 400,
        message: "Dish price must be an integer",
    });
}

function hasPrice(req, res, next) {
    const { price } = res.locals.foundDish;

    if(price) {
        next();
        return;
    }
    next({
        status: 400,
        message: "Dish must include a price",
    });
}

function priceGreaterThanZero(req, res, next) {
    const { price } = res.locals.foundDish;

    if(price > 0) {
        next();
        return;
    }
    next({
        status: 400,
        message: "Dish must have a price that is an integer greater than 0",
    });
}

function hasImage(req, res, next) {
    const { image_url } = res.locals.foundDish;

    if(image_url) {
        next();
        return;
    }
    next({
        status: 400,
        message: "Dish must include a image_url",
    });
}

function dishExists(req, res, next) {
    const { dishId } = req.params;
    const dishIndex = dishes.findIndex((dish) => dish.id === dishId);

    if(dishIndex !== -1) {
        res.locals.dishIndex = dishIndex;
        res.locals.foundDish = dishes[dishIndex];
        next();
        return;
    }
    next({
        status: 404,
        message: `Dish does not exist: ${dishId}.`
    });
}

function bodyIdMatchesRoute(req, res, next) {
    const { dishId } = req.params;
    const updatedDish = res.locals.foundDish;

    if(!updatedDish.id) {
        updatedDish.id = dishId;
        next();
        return;
    }

    if(updatedDish.id == dishId) {
        next();
        return;
    }
    next({
        status: 400,
        message: `Order id does not match route id. Order: ${updatedDish.id}, Route: ${dishId}.`,
    });
}

function create(req, res) {
    const newDish = res.locals.foundDish;

    newDish.id = nextId();

    dishes.push(newDish);

    res.status(201).json({ data: newDish });
}

function read(req, res) {
    res.status(200).json({ data: res.locals.foundDish});
}

function update(req, res) {
    const updatedDish = res.locals.foundDish;
    const dishIndex = res.locals.dishIndex;

    dishes[dishIndex] = updatedDish;

    res.status(200).json({ data: updatedDish });
}

function list(req, res) {
    res.status(200).json({ data: dishes });
}

module.exports = {
    create: [
        initData,
        hasName,
        hasDescription,
        hasPrice,
        priceIsNumber,
        priceGreaterThanZero,
        hasImage,
        create,
    ],
    update: [
        dishExists,
        initData,
        bodyIdMatchesRoute,
        hasName,
        hasDescription,
        hasPrice,
        priceIsNumber,
        priceGreaterThanZero,
        hasImage,
        update,
    ],
    read: [
        dishExists,
        read,
    ],
    list,
}