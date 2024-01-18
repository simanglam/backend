import { NextFunction, Router, Request, Response, request } from "express"

const router = Router()

router.use((req: Request, res: Response, next: NextFunction) => {
    if(request.session?.data?.login){
        next()
    }
    else{
        res.status(403).send("You are not logged in")
        res.redirect('/login')
    }
})

router.get('/main', (req, res) => {
    res.send(`Hello World! ${req.session.data?.name}`)
})



export default router