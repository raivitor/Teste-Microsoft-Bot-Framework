const axios = require('axios');
const { ActivityHandler, CardFactory, AttachmentLayoutTypes } = require('botbuilder');
const adaptiveCard = require('./resources/adaptiveCard.json');
const cotacaoCard = require('./resources/cotacaoCard');
const roomCard = require('./resources/roomCard');

const rooms = {};

class MyBot extends ActivityHandler {
    constructor() {
        super();

        this.onMembersAdded(async (context, next) => {
            const membersAdded = context.activity.membersAdded;
            for (let cnt = 0; cnt < membersAdded.length; cnt++) {
                if (membersAdded[cnt].id !== context.activity.recipient.id) {
                    await context.sendActivity('Seja bem vindo õ/');
                    await next();
                }
            }
        });

        this.onMessage(async (context, next) => {
            if (this.isPostback(context.activity)) {
                const label = context.activity.value.label;
                if (label === 'COTACAO_INPUT') {
                    const { checkin, checkout } = context.activity.value;
                    await this.getSearchEngine(context, checkin, checkout);
                } else if (label.includes('PAYLOAD_INFO')) {
                    const room = rooms[label.split('_')[2]];

                    await context.sendActivity(room.fullDescription);
                    await context.sendActivity(this.concatService(room.service));

                    await context.sendActivity('Segue as imagens do quarto');
                    room.image.map(async value => {
                        const reply = {};
                        reply.attachments = [{
                            name: 'architecture-resize.png',
                            contentType: 'image/png',
                            contentUrl: value
                        }];
                        await context.sendActivity(reply);
                    });
                }
            } else {
                const text = context.activity.text.toUpperCase();
                if (text.includes('COTAÇÃO')) {
                    await context.sendActivity({ attachments: [this.createAdaptiveCard(cotacaoCard)] });
                } else if (text.includes('SOBRE')) {
                    await context.sendActivity('Mussum ipsum cacilds, vidis litro abertis. Consetis adipiscings elitis. Pra lá , depois divoltis porris, paradis. Paisis, filhis, espiritis santis. Mé faiz elementum girarzis, nisi eros vermeio, in elementis mé pra quem é amistosis quis leo. Manduma pindureta quium dia nois paga. Sapien in monti palavris qui num significa nadis i pareci latim. Interessantiss quisso pudia ce receita de bolis, mais bolis eu num gostis.');
                } else {
                    await context.sendActivity({ attachments: [this.createAdaptiveCard(adaptiveCard)] });
                }
            }

            await next();
        });
    }

    concatService(services) {
        let str = 'Serviços \n\n';
        services.map(value => {
            str = str.concat('- ', value, '\n');
        });
        return str;
    }

    createAdaptiveCard(card) {
        return CardFactory.adaptiveCard(card);
    }

    isPostback(context) {
        return context.channelData.postBack;
    }

    formatDate(date) {
        const data = new Date(date);
        data.setDate(data.getDate() + 1);

        const dia = data.getDate().toString();
        const diaF = (dia.length == 1) ? '0' + dia : dia;
        const mes = (data.getMonth() + 1).toString();
        const mesF = (mes.length == 1) ? '0' + mes : mes;
        const anoF = data.getFullYear();
        return `${ diaF }/${ (mesF) }/${ anoF }`;
    };

    jsonCopy(src) {
        return JSON.parse(JSON.stringify(src));
    }

    async getSearchEngine(context, checkin, checkout) {
        const obj = {
            checkin: this.formatDate(checkin),
            checkout: this.formatDate(checkout)
        };

        await context.sendActivity('Estou buscando as melhores acomocações para você. Logo logo irei te mostrar quartos incríveis');

        await axios.post('http://localhost:3000/api/buscar', obj)
            .then(async resp => {
                console.log(resp.data.length);
                if (resp.data.length === 0) {
                    await context.sendActivity('Não tem quarto disponível data selecionada');
                } else {
                    const elements = resp.data.map(value => {
                        rooms[value.name] = value;
                        const auxRoomCard = this.jsonCopy(roomCard);
                        auxRoomCard.body[0].images[0].url = value.image[0];
                        auxRoomCard.body[1].items[0].text = `${ value.name } - ${ value.price }`;
                        auxRoomCard.body[1].items[1].text = value.description;
                        auxRoomCard.body[2].actions[0].url = value.link;
                        auxRoomCard.body[3].value = `PAYLOAD_INFO_${ value.name }`;
                        return this.createAdaptiveCard(auxRoomCard);
                    });

                    await context.sendActivity({
                        attachments: elements,
                        attachmentLayout: AttachmentLayoutTypes.Carousel
                    });
                }
            })
            .catch(e => console.log(e));
    };
}

module.exports.MyBot = MyBot;
