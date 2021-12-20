import { Router } from 'express'
import { getUser, getUsers, partialDeleteUser, postUser, putUser, totalDeleteUser } from "../controllers/user.controller";


const router = Router()


router.get('/', getUsers)

router.get('/:id', getUser)

router.post('/', postUser)

router.put('/:id', putUser)

router.delete('/partial-delete/:id', partialDeleteUser)

router.delete('/total-delete/:id', totalDeleteUser)


export default router