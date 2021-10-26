import App from './app'

async function main(){
    const app = new App();
    await app.init();
    app.run();
}

main().catch(err => console.log(err));
