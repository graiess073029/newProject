const { exec } = require("child_process");

export const executeCommand = (command : string) => {
    exec(command,{shell: true}, (error : Error) => {
        console.log("Executed command:", command);
        if (error) {
            console.error(`Error executing command: ${error.message}`);
            return;   
        }   
    })
}


