import fs from 'fs';
import * as ftp from 'basic-ftp';


const connectToFTP = async () => {
    const client = new ftp.Client()
    client.ftp.verbose = true
    const clientAccessInfo = {
        host: process.env.FTP_HOST as string,
        user: process.env.FTP_USER as string,
        password: process.env.FTP_PASSWORD as string,
        port: parseInt(process.env.FTP_PORT as string),
        secure: false
    }
    await client.access(clientAccessInfo)
    return client
}


export const uploadDirToFTP = async(dirPath: string, ftpPath?: string) =>{
    try{
        const client = await connectToFTP();
        await client.uploadFromDir(dirPath, ftpPath==null?'/':ftpPath.startsWith('/')?ftpPath:`/${ftpPath}`);
        await client.close()
    }
    catch(err: any){
        console.log({err})
    }
}

export const getFileNamesInDir = async(ftpDir: string) => {
    try{
        const client = await connectToFTP();
        const list = await client.list(`${ftpDir}${ftpDir.endsWith('/')?'':'/'}`);
        return list
    }
    catch(err: any){
        console.log('ERROR: ', err)
        return [];
    }
}



export const getModificationInfo = async(ftpPath: string, ) => {
    const client = await connectToFTP()
    const checkDate = new Date(await client.lastMod(ftpPath))
    const modDate = `${checkDate.getMonth()+1}-${checkDate.getDate()}-${checkDate.getFullYear()};${checkDate.getHours()}H:${checkDate.getMinutes()}M`
    console.log({modDate})
    return modDate
}


export const findFtpFilesContaining = async(ftpDir: string, fileString: string) => {
    try{
        const client = await connectToFTP();
        const list = await client.list(`${ftpDir}${ftpDir.endsWith('/')?'':'/'}`);
        const matching = list.filter(file=>file.name.toLowerCase().includes(fileString.toLowerCase())).map(m=>m.name);
        console.log({matching})
        await client.close()
        return matching
    }
    catch(err: any){
        console.log('ERROR: ', err)
        return [];
    }
}


export const removeFromFTP = async(ftpPath: string) => {
    try{
        const client = await connectToFTP();
        await client.remove(ftpPath)
        await client.close()
    }
    catch(err: any){
        console.log('ERROR: ', err)
    }
}


export const downloadFromFTP = async(ftpPath: string, saveFilePath: string, startAt?: number) => {
   
    const client = await connectToFTP()
    console.log("DOWNLOADING", ftpPath, ' : ', saveFilePath)
    const starter = startAt==null?0:startAt
    await client.downloadTo(saveFilePath, ftpPath, starter);
    await client.close()


}


export const saveToFTP = async(srcFilePath: string, saveFilePath: string, remove: boolean) => {
    const client = await connectToFTP();
    await client.uploadFrom(srcFilePath, saveFilePath);
    // console.log("UPLOADING")
    // console.log({ftpResp});
    // const resCode = `${ftpResp.code}`.substring(0,1);
    // const badStarts = ['4', '5'];
    if(remove){
        fs.rmSync(srcFilePath)
    }
    await client.close()


}




 


export const saveMultipleFilesToFTP = async(srcFilePath: string, saveFilePath: string, files: string[], remove: boolean) => {
    try{
        const client = await connectToFTP();
        const finalSavePath = saveFilePath.endsWith('/')?saveFilePath:`${saveFilePath}/`
        const finalSrcPath = srcFilePath.endsWith('/')?srcFilePath:`${srcFilePath}/`
        for(let file=0;file<files.length;file++){
            await client.uploadFrom(`${finalSrcPath}${files[file]}`, `${finalSavePath}${files[file]}`);
            if(remove){
                fs.rmSync(`${finalSrcPath}${files[file]}`)
            }
        }
        await client.close()
    }
    catch(err: any){
        console.log('err');
    }
   
   
}

