import { Router, Request, Response } from 'express';
import { ProcessamentoAutoControler, ProcessamentoControler, ProcessamentoFacboockControler, ProcessamentoInstagramControler, ProcessamentoTelegramControler, ProcessamentoWhatsAppControler } from '../src/controller/ProcessamentoControle';
 
const routes = Router();

routes.get('/', (req: Request, res: Response) => {
    return res.json({status: 'OK'})
})

routes.get('/processar',         ProcessamentoControler)
routes.get('/processarSite',     ProcessamentoAutoControler)
routes.get('/processarInstagram', ProcessamentoInstagramControler)
routes.get('/processarTelegram', ProcessamentoTelegramControler)
routes.get('/processarWhatsApp', ProcessamentoWhatsAppControler)
routes.get('/processarFacboock', ProcessamentoFacboockControler)


export default routes;