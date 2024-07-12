import fs from 'fs'
import path from 'path'

const savePath = "contracts/data"
const dirPath = "data"
const SOL_HEADER =  "// SPDX-License-Identifier: GPL-3.0 \n pragma solidity >=0.7.0 <0.9.0; \n\n";
const SOL_FOOTER = "\n }";
const SOL_CONTRACT_NAME = "contract GenFWStorage";
const SOL_PREFIX = "bytes32 constant public";
const MAX_CONTENTS = 335; 

const main = async () => {
    let jsonData = fs.readFileSync(path.join(dirPath, 'generate-assets3.json'), "utf-8");
    let storageData = JSON.parse(jsonData);
    const out:string[] = [];

    let createSolidity = `${SOL_HEADER}${SOL_CONTRACT_NAME}1 {\n`;
    let counter = 0; 
    let indexer = 1;
    for (let i = 0; i < storageData.length; i++) {
        for (let j = 0; j < storageData[i].data.length; j++) {
            if(counter == MAX_CONTENTS){
                counter = 0;
                indexer ++;
                createSolidity += SOL_FOOTER;
                const created = createSolidity;
                out.push(created);
                createSolidity = `${SOL_HEADER}${SOL_CONTRACT_NAME}${indexer} {\n`;
                
            }
            if(storageData[i].amount != 0){
                const contents = `\t${SOL_PREFIX} _${storageData[i].data[j].hash} = ${storageData[i].data[j].hash};\n`;
                createSolidity += contents;  
                counter++;
            }

        }
    }
    if(counter > 0){
        createSolidity += SOL_FOOTER;
        const created = createSolidity;
        out.push(created);
    }

    for (let i = 0; i < out.length; i++) {
        fs.writeFile(path.join(savePath, `GenFWStorage${i+1}.sol`), out[i], 'utf-8', (err) => {
            if (err) {
            console.log(err);
            }
        })
    }
    
    
}

main()