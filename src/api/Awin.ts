import axios from 'axios';
import { tipoServicoEnum } from '../enum/TipoServicoEnum';

export const ExecAwin = async (lsEntrada: any) => {
    console.log(`Executou rotina ${tipoServicoEnum.AWIN.toString()}`)
    return "OK";
}