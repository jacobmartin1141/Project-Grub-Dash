
function checkProperties(target) {

    return function propertiesHandler() {
        const requiredProps = [...arguments];

        return (req, res, next) => {
            const missingProp = requiredProps.find((prop) => {
                if(!res.locals[target][prop]) {
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
                message: `'${target}' must include property '${missingProp}'`
            });
        }
    }

}

module.exports = checkProperties;