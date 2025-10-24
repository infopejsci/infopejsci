import fetch from 'node-fetch';
import { JSDOM } from 'jsdom';
import nodemailer from "nodemailer";

const url = 'https://www.mpb.cz/cs/utulek/venceni-pro-verejnost.html';

const SEZNAM_USER = process.env.SEZNAM_USER;
const SEZNAM_PASS = process.env.SEZNAM_PASS;
const TO_EMAIL = process.env.TO_EMAIL;
const TO_EMAIL_SECOND = process.env.TO_EMAIL_SECOND;

fetch(url)
    .then(response => {
        if (!response.ok) {
            throw new Error(`Chyba při načítání: ${response.status}`);
        }
        return response.text();
    })
    .then(htmlText => {
        const dom = new JSDOM(htmlText);
        const doc = dom.window.document;

        const select = doc.getElementById('elform11422');
        const options = select.options;

        console.log("found options:", options.length - 1);
        if (options.length > 1) {
            const dates = [];
            for (let i = 1; i < options.length; i++) {
                const date = options[i].text;
                dates.push(date);
            }

            const transporter = nodemailer.createTransport({
                host: "smtp.seznam.cz",
                port: 465,
                secure: true,
                auth: {
                    user: SEZNAM_USER,
                    pass: SEZNAM_PASS,
                },
            });

            transporter.sendMail({
                from: SEZNAM_USER,
                to: [ TO_EMAIL, TO_EMAIL_SECOND ],
                subject: "Venčení pejsků!",
                text: `Nové datumy na venčení pejsků: ${dates.join(', ')}`,
            }).then(() => {
                console.log("mail sent!");
            }).catch((error) => {
                console.log(error)
            });
            
        }

    })
    .catch(error => {
        console.error('Chyba při fetch:', error);
    });
