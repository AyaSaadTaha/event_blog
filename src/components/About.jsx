import React from 'react';
import "./About.css";

const About = () => {
    return (
        <div className="about-page">
            <h1>Über uns</h1>
            <p>
                <strong>Willkommen auf unserem Event‑Blog!</strong> 🎉<br />
                Wir sind Aya und Lidiia, die Teilnehmerinnen des Coding Bootcamps von Bright &amp; Winona –
                einer intensiven Reise voller Code, Kreativität und Community.
            </p>

            <p>
                Hier berichten wir über alles: von spannenden Workshops über inspirierende Speaker‑Sessions
                bis hin zu After‑Work‑Meetups und kleinen Alltagsmomenten, die uns zusammenschweißen.
            </p>

            <p>
                Ob du selbst im Bootcamp bist, mal teilnehmen möchtest oder einfach neugierig bist,
                wie Tech‑Events ablaufen: Hier bist du richtig.
            </p>

            <p>
                Komm vorbei, lies mit, kommentiere – und werde Teil unserer Coding‑Community!
            </p>
        </div>
    );
};

export default About;