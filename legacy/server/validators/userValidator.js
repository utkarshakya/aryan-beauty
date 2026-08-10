import { body, validationResult } from "express-validator";

export const validateRegistration = [
    body('name', 'Name is Required, You can Leave it Empty').trim().notEmpty(),
    body('email', 'Email Address You Provided Is Not A Valid Email').trim().isEmail(),
    body('password', "Sorry, Please make a Strong Password").trim().isStrongPassword(),
    body('*', "Sorry You Can't Play With Us. No Field Can Be Too Long In Length").isLength({'max': 50})
]

export const validateLogin = [
    body('email', 'Email Is Not In Valid Format').trim().isEmail(),
    body('*', "Sorry You Can't Play With Us. No Field Can Be Too Long In Length").isLength({'max': 50})
]

export const handleValidationErrors = (req, res, next) => {
    const errors = validationResult(req)['errors']
    if(errors.length !== 0){
        const message = []
        errors.forEach(element => {
            message.push(element['msg'])
        });
        return res.status(400).send(message[0])
    }
    next()
}