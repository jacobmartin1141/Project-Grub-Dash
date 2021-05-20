const e = require("express");
const path = require("path");

// Use the existing order data
const orders = require(path.resolve("src/data/orders-data"));

// Use this function to assigh ID's when necessary
const nextId = require("../utils/nextId");


const propertiesExist = require("../utils/propertiesExist")("foundOrder");

const propertyValuesValid = require("../utils/propertyValuesValid")("foundOrder");


function checkNewOrder(req, res, next) {
    res.locals.foundOrder = req.body.data;
    next();
}

function checkExistingOrder(req, res, next) {
    const { orderId } = req.params;

    const orderIndex = orders.findIndex((order) => order.id === orderId);

    if(orderIndex === -1) {
        next({
            status: 404,
            message: `Order does not exist: ${orderId}.`,
        });
        return;
    }
    res.locals.orderIndex = orderIndex;
    res.locals.foundOrder = orders[orderIndex];
    next();
}


function hasValidDishes(req, res, next) {
    const { dishes } = res.locals.foundOrder;

    if(Array.isArray(dishes)) {
        next();
        return;
    }
    next({
        status: 400,
        message: "Order must include at least one dish",
    });
}

function hasValidQuantity(req, res, next) {
    const { dishes } = res.locals.foundOrder;

    const foundIndex = dishes.findIndex((dish, index) => {
        return(!dish.quantity || !Number.isInteger(dish.quantity));
    });

    if(foundIndex === -1) {
        next();
        return;
    }
    
    next({
        status: 400,
        message: `Dish ${foundIndex} must have a quantity that is an integer greater than 0`
    });
}


function bodyIdMatchesRoute(req, res, next) {
    const { orderId } = req.params;
    const id = res.locals.foundOrder.id

    if(!id) {
        res.locals.foundOrder.id = orderId;
        next();
        return;
    }
    if(id === orderId) {
        next();
        return;
    }
    next({
        status: 400,
        message: `Order id does not match route id. Order: ${id}, Route: ${orderId}.`,
    });
}


function update(req, res) {
    const updatedOrder = res.locals.foundOrder;
 
    orders[res.locals.foundIndex] = updatedOrder;

    res.status(200).json({ data: updatedOrder });
}

function remove(req, res) {
    orders.splice(res.locals.foundIndex, 1);

    res.status(204).send();
}

function list(req, res) {
    res.status(200).json({ data: orders });
}

function read(req, res) {
    res.status(200).json({ data: res.locals.foundOrder});
}

function create(req, res) {
    const newOrder = res.locals.foundOrder;

    newOrder.id = nextId();

    orders.push(newOrder);

    res.status(201).json({ data: newOrder });
}

module.exports = {
    create: [
        checkNewOrder,
        propertiesExist(
            "mobileNumber",
            "deliverTo",
            "dishes",
        ),
        propertyValuesValid(
            ["dishes", false, [ [], ]], //Equivilent of " ![ '[]' ].includes(order["dishes"]) "
        ),
        hasValidDishes,
        hasValidQuantity,
        create,
    ], read: [
        checkExistingOrder,
        read,
    ], update: [
        checkExistingOrder,
        checkNewOrder,
        bodyIdMatchesRoute,
        propertiesExist(
            "mobileNumber",
            "deliverTo",
            "status",
            "id",
            "dishes",
        ),
        hasValidDishes,
        hasValidQuantity,
        propertyValuesValid(
            ["status", true, [
                "pending", 
                "preparing",
                "out-for_delivery",
            ]],
            ["dishes", false, [
                [],
            ]],
        ),
        update,
    ], remove: [
        checkExistingOrder,
        propertyValuesValid(
            ["status", true, [
                "pending",
            ]],
        ),
        remove,
    ], list,
}
