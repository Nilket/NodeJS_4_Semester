      
    const replCodeOutput = document.getElementById('repl-code-output');
    const replInputInput = document.getElementById('repl-input');

      replInputInput.addEventListener('keyup', (event) =>{
        if(event.key === 'Enter'){
            runReplInput();
        }
      });

    function runReplInput(){
        const replCode = replInputInput.value;
        replInputInput.value = "";

        fetch('/api/repl',{
            method: "POST",
            body: JSON.stringify({ replCode }),
            headers: {
                "Content-Type": "application/json"
            }
        })
        .then((response) => response.json())
        .then((data) => {
                if(data.error){
                    console.log(data.error);

                } else {
                    console.log(data.output, data.result);
                }

        });
    }

      
      
     


