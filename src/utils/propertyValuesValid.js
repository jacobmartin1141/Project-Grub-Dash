function checkValues(target) {

    return function valuesHandler() {
        const requiredValues = [...arguments];

        //Prop[0] is the property who's value we're checking
        //Prop[2] is the list of acceptable values for Prop[0]
        //Prop[1] is wheather we want a true or false evaluation, if we wanna check that a property DOESN'T include a value, we cahnge this to false

        return (req, res, next) => {
            const foundProp = requiredValues.find((prop) => {
                
                const foundSubprop = prop[2].find((subProp) => {
                    return (subProp.toString() === res.locals[target][prop[0]].toString());
                })

                if((foundSubprop !== undefined) !== prop[1]) {
                    
                    return true;
                }
                
                return false;
            });
            
            if(foundProp === undefined) {
                next();
                return;
            }

            next({
                status: 400,
                message: `${target}'s '${foundProp[0]}' must be '${foundProp[2].join("', or '")}'.`,
            });
        }
    }
}

module.exports = checkValues;