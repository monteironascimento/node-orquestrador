export function removeAcento (text)
{       
    text = text.toLowerCase();                                                         
    text = text.replaceAll(new RegExp('[ÁÀÂÃ]','gi'), 'a');
    text = text.replaceAll(new RegExp('[ÉÈÊ]','gi'), 'e');
    text = text.replaceAll(new RegExp('[ÍÌÎ]','gi'), 'i');
    text = text.replaceAll(new RegExp('[ÓÒÔÕ]','gi'), 'o');
    text = text.replaceAll(new RegExp('[ÚÙÛ]','gi'), 'u');
    text = text.replaceAll(new RegExp('[Ç]','gi'), 'c');
    text = text.replaceAll('&amp;', '&');
    text = text.replaceAll('ä', 'a');
    text = text.replaceAll('ü', 'u');
    text = text.replaceAll('®', '');
    text = text.replaceAll('l&', '');
    text = text.replaceAll('  ', ' ');
    
    return text;                 
}

export function removeAcentoNormal (text)
{       
    //text = text.toLowerCase();                                                         
    text = text.replaceAll(new RegExp('[ÁÀÂÃ]','gi'), 'a');
    text = text.replaceAll(new RegExp('[ÉÈÊ]','gi'), 'e');
    text = text.replaceAll(new RegExp('[ÍÌÎ]','gi'), 'i');
    text = text.replaceAll(new RegExp('[ÓÒÔÕ]','gi'), 'o');
    text = text.replaceAll(new RegExp('[ÚÙÛ]','gi'), 'u');
    text = text.replaceAll(new RegExp('[Ç]','gi'), 'c');
    text = text.replaceAll('&amp;', '&');
    text = text.replaceAll('ä', 'a');
    text = text.replaceAll('ü', 'u');
    text = text.replaceAll('®', '');
    text = text.replaceAll('l&', '');
    text = text.replaceAll('  ', ' ');
    
    return text;                 
}

export function removeAcentoLink (text)
{       
    text = text.toLowerCase();                                                         
    text = text.replaceAll(new RegExp('[ÁÀÂÃ]','gi'), 'a');
    text = text.replaceAll(new RegExp('[ÉÈÊ]','gi'), 'e');
    text = text.replaceAll(new RegExp('[ÍÌÎ]','gi'), 'i');
    text = text.replaceAll(new RegExp('[ÓÒÔÕ]','gi'), 'o');
    text = text.replaceAll(new RegExp('[ÚÙÛ]','gi'), 'u');
    text = text.replaceAll(new RegExp('[Ç]','gi'), 'c');
    text = text.replaceAll('&amp;', '&');
    text = text.replaceAll('ä', 'a');
    text = text.replaceAll('ü', 'u');
    text = text.replaceAll('®', '');
    text = text.replaceAll('l&', '');
    text = text.replaceAll('  ', ' ');
    text = text.replaceAll(' ', '-');
    
    return text;                 
}

export function compararString(frase1: string, frase2: string): boolean {
    
    const a = new String(removeAcento(frase1)).toLowerCase();
    const b = new String(removeAcento(frase2)).toLowerCase();

    if(a.valueOf().trim() === b.valueOf().trim()){
        return true;
    }
    
    return false;
}