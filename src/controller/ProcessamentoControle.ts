import { Request, Response } from 'express';
import { ExecInstagram } from '../../src/api/Instagram'
import { ExecFacboock } from '../../src/api/Facboock'
import { ExecWatsApp } from '../../src/api/Whatsapp'
import { ExecTelegram } from '../../src/api/Telegram'
import { ExecSite } from '../../src/api/ExecSite';
import { tipoServicoEnum } from '../enum/TipoServicoEnum';
import { ExecSiteAuto } from '../api/ExecSiteAuto';

export const ProcessamentoControler = async (req: Request, res: Response) => {

    try{
        console.log("START PROCESSAMENTO WORDPRESS")
        await ExecSite({ idPlataforma: 11, tipoServico:  tipoServicoEnum.WORDPRESS })
    }catch(error){
        console.log(error);
    }
    
    return res.json("OK");
}

export const ProcessamentoAutoControler = async (req: Request, res: Response) => {

    try{
        console.log("START PROCESSAMENTO WORDPRESS")
        await ExecSiteAuto({ idPlataforma: 11, tipoServico:  tipoServicoEnum.SITE })
    }catch(error){
        console.log(error);
    }
    
    return res.json("OK");
}




export const ProcessamentoTelegramControler = async (req: Request, res: Response) => {

    try{
        console.log("START PROCESSAMENTO WORDPRESS")
        await ExecTelegram({ idPlataforma: 11, tipoServico:  tipoServicoEnum.TELEGRAM , username: '-1001391470703', tipoServicoOrigem: 11 })
    }catch(error){
        console.log(error);
    }

    return res.json("OK");
}

export const ProcessamentoFacboockControler = async (req: Request, res: Response) => {

    try{
        console.log("START PROCESSAMENTO WORDPRESS")
        await ExecFacboock({ idPlataforma: 11, tipoServico:  tipoServicoEnum.FACBOOCK , username: 'https://www.facebook.com/ofertabestt' , tipoServicoOrigem: 11 })
    }catch(error){
        console.log(error);
    }
    
    return res.json("OK");
}

export const ProcessamentoWhatsAppControler = async (req: Request, res: Response) => {

    try{
        console.log("START PROCESSAMENTO WORDPRESS")
        await ExecWatsApp({ idPlataforma: 11, tipoServiceDestino:  tipoServicoEnum.WHATSAPP , username: '-1001391470703554497764607-1610729478@g.us', tipoServicoOrigem: 11 })
    }catch(error){
        console.log(error);
    }
    
    return res.json("OK");
}

export const ProcessamentoInstagramControler = async (req: Request, res: Response) => {

    try {
        console.log("START PROCESSAMENTO INSTAGRAM")
        await ExecInstagram({ 
                        idPlataforma: 11, 
                        tipoServicoOrigem: 11,
                        tipoServiceDestino:  tipoServicoEnum.INSTAGRAM, 
                        username: 'ofertabest._',
                        password: 'Monteiro01*',
                     })
    } catch (error) {
        console.log(error)    
    }

    await sleep(18000)

    try {
        console.log("START PROCESSAMENTO INSTAGRAM")
        await ExecInstagram({ 
                        idPlataforma: 11, 
                        tipoServicoOrigem: 11,
                        tipoServiceDestino:  tipoServicoEnum.INSTAGRAM, 
                        username: 'ofertabestt',
                        password: 'Monteiro01*',
                     })
    } catch (error) {
        console.log(error)    
    }

    return res.json("OK");
}


async function sleep(ms) {
    return new Promise((resolve) => {
      setTimeout(resolve, ms);
    });
  } 