const e = require("express");
const path = require("path");

// Use the existing order data
const orders = require(path.resolve("src/data/orders-data"));

// Use this function to assigh ID's when necessary
const nextId = require("../utils/nextId");


function initData(req, res, next) {
    res.locals.foundOrder = req.body.data;
    next();
}


function checkProperties() {
    const requiredProps = [...arguments];

    return (req, res, next) => {
        const missingProp = requiredProps.find((prop) => {
            if(!res.locals.foundOrder[prop]) {
                return true;
            }
            return false;
        });

        if(missingProp === undefined) {
            next();
            return;
        }
        next({
            status:400,
            message: `Order must include property ${missingProp}`
        })
    }
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

    if(dishes.length === 0) {
        next({
            status: 400,
            message: "Order must include at least one dish."
        });
        return;
    }

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

function hasValidStatus(req, res, next) {
    const ordersStatus = res.locals.foundOrder.status;
    const validStatus = [
        "pending",
        "preparing",
        "out-for_delivery",
        "delivered",
    ];
    
    if(validStatus.includes(ordersStatus)) {
        next();
    }
    next({
        status: 400,
        message: `Order must have a status of pending, preparing, out-for-delivery, delivered: ${ordersStatus}`,
    });
    return;
}


function orderExists(req, res, next) {
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

function notDelivered(req, res, next) {
    const ordersStatus = res.locals.foundOrder.status;

    if(ordersStatus === "delivered") {
        next({
            status: 400,
            message: "Order status is delivered",
        });
        return;
    }
    next();
}

function isPending(req, res, next) {
    const ordersStatus = res.locals.foundOrder.status;

    if(ordersStatus === "pending") {
        next();
        return;
    }
    next({
        status: 400,
        message: "Order status is pending",
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
        initData,
        checkProperties(
            "mobileNumber",
            "deliverTo",
            "dishes",
        ),
        hasValidDishes,
        hasValidQuantity,
        create,
    ],
    read: [
        orderExists,
        read,
    ],
    update: [
        orderExists,
        initData,
        bodyIdMatchesRoute,
        checkProperties(
            "mobileNumber",
            "deliverTo",
            "status",
            "id",
            "dishes",
        ),
        hasValidDishes,
        hasValidQuantity,
        hasValidStatus,
        notDelivered,
        update,
    ],
    remove: [
        orderExists,
        isPending,
        remove,
    ],
    list,
}
