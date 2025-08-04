import React, { useEffect, useState } from 'react';
import { collection, getDocs, doc, deleteDoc, updateDoc, getDoc } from 'firebase/firestore';
import { auth, db } from "../firebase/config";
import { onAuthStateChanged } from 'firebase/auth';
import * as XLSX from 'xlsx';
import { jsPDF } from 'jspdf';
import 'jspdf-autotable';


export default function BenutzerVerwaltung() {
    const [benutzer, setBenutzer] = useState([]);
    const [gefilterteBenutzer, setGefilterteBenutzer] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isAdmin, setIsAdmin] = useState(false);
    const [suche, setSuche] = useState('');
    const [rollenFilter, setRollenFilter] = useState('');
    const [bearbeiteBenutzerId, setBearbeiteBenutzerId] = useState(null);
    const [bearbeitungsFormular, setBearbeitungsFormular] = useState({
        name: '',
        telefon: '',
        rolle: ''
    });
    const [aktuelleSeite, setAktuelleSeite] = useState(1);
    const benutzerProSeite = 10;

    useEffect(() => {
        const checkAdminUndLadeBenutzer = async () => {
            onAuthStateChanged(auth, async (user) => {
                if (user) {
                    const benutzerRef = doc(db, "users", user.uid);
                    const benutzerSnap = await getDoc(benutzerRef);
                    if (benutzerSnap.exists() && benutzerSnap.data().role === "admin") {
                        setIsAdmin(true);
                        await ladeBenutzer();
                    }
                    setLoading(false);
                }
            });
        };
        checkAdminUndLadeBenutzer();
    }, []);

    const ladeBenutzer = async () => {
        const querySnapshot = await getDocs(collection(db, "users"));
        const benutzerListe = querySnapshot.docs.map((doc) => ({
            id: doc.id,
            ...doc.data()
        }));
        setBenutzer(benutzerListe);
        setGefilterteBenutzer(benutzerListe);
    };

    useEffect(() => {
        const gefiltert = benutzer.filter((u) => {
            const suchTreffer =
                u.name?.toLowerCase().includes(suche.toLowerCase()) ||
                u.email?.toLowerCase().includes(suche.toLowerCase());

            const rollenTreffer = rollenFilter ? u.role === rollenFilter : true;
            return suchTreffer && rollenTreffer;
        });
        setGefilterteBenutzer(gefiltert);
        setAktuelleSeite(1);
    }, [suche, rollenFilter, benutzer]);

    const handleLoeschen = async (id) => {
        if (window.confirm("Möchten Sie diesen Benutzer wirklich löschen?")) {
            await deleteDoc(doc(db, "users", id));
            ladeBenutzer();
        }
    };

    const starteBearbeitung = (benutzer) => {
        setBearbeiteBenutzerId(benutzer.id);
        setBearbeitungsFormular({
            name: benutzer.name,
            telefon: benutzer.phone,
            rolle: benutzer.role,
        });
    };

    const abbrechenBearbeitung = () => {
        setBearbeiteBenutzerId(null);
        setBearbeitungsFormular({ name: '', telefon: '', rolle: '' });
    };

    const handleBearbeitungsAenderung = (e) => {
        setBearbeitungsFormular({ ...bearbeitungsFormular, [e.target.name]: e.target.value });
    };

    const speichereBearbeitung = async () => {
        const benutzerRef = doc(db, "users", bearbeiteBenutzerId);
        await updateDoc(benutzerRef, {
            name: bearbeitungsFormular.name,
            phone: bearbeitungsFormular.telefon,
            role: bearbeitungsFormular.rolle,
        });
        abbrechenBearbeitung();
        ladeBenutzer();
    };

    const exportiereZuExcel = () => {
        const worksheet = XLSX.utils.json_to_sheet(gefilterteBenutzer);
        const workbook = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(workbook, worksheet, "Benutzer");
        XLSX.writeFile(workbook, "benutzer.xlsx");
    };

    const exportiereZuPDF = () => {
        const docPDF = new jsPDF();

        // Titel hinzufügen
        docPDF.text("Benutzerliste", 14, 15);

        // Tabellenkopf
        const spalten = ["Name", "E-Mail", "Telefon", "Rolle"];

        // Tabellendaten
        const zeilen = gefilterteBenutzer.map(u => [
            u.name || '-',
            u.email || '-',
            u.phone || '-',
            u.role || '-'
        ]);

        // Tabelle erstellen
        docPDF.autoTable({
            head: [spalten],
            body: zeilen,
            startY: 20,
            styles: {
                cellPadding: 5,
                fontSize: 10,
                valign: 'middle',
                halign: 'left'
            },
            headStyles: {
                fillColor: [41, 128, 185],
                textColor: 255,
                fontStyle: 'bold'
            },
            alternateRowStyles: {
                fillColor: [245, 245, 245]
            }
        });

        docPDF.save("benutzer.pdf");
    };

    const rollenZaehlung = {
        user: benutzer.filter(u => u.role === "user").length,
        moderator: benutzer.filter(u => u.role === "moderator").length,
        admin: benutzer.filter(u => u.role === "admin").length,
    };

    const indexLetzter = aktuelleSeite * benutzerProSeite;
    const indexErster = indexLetzter - benutzerProSeite;
    const aktuelleBenutzer = gefilterteBenutzer.slice(indexErster, indexLetzter);
    const seitenAnzahl = Math.ceil(gefilterteBenutzer.length / benutzerProSeite);

    const naechsteSeite = () => setAktuelleSeite((p) => Math.min(p + 1, seitenAnzahl));
    const vorherigeSeite = () => setAktuelleSeite((p) => Math.max(p - 1, 1));

    if (loading) return <p>Lade Daten...</p>;
    if (!isAdmin) return <p>Zugriff verweigert: Nur Administratoren dürfen diese Seite aufrufen.</p>;

    return (
        <div style={{ padding: '20px', fontFamily: 'Arial, sans-serif' }}>
            <h2>🔧 Admin Dashboard</h2>

            {/* Such- und Filterfunktionen */}
            <div style={{ marginBottom: '20px', display: 'flex', gap: '10px' }}>
                <input
                    type="text"
                    placeholder="Nach Name oder E-Mail suchen"
                    value={suche}
                    onChange={(e) => setSuche(e.target.value)}
                    style={{ padding: '8px', flexGrow: 1 }}
                />
                <select
                    value={rollenFilter}
                    onChange={(e) => setRollenFilter(e.target.value)}
                    style={{ padding: '8px' }}
                >
                    <option value="">Alle Rollen</option>
                    <option value="user">Benutzer</option>
                    <option value="moderator">Moderator</option>
                    <option value="admin">Administrator</option>
                </select>
            </div>

            {/* Export-Buttons */}
            <div style={{ marginBottom: '20px', display: 'flex', gap: '10px' }}>
                <button
                    onClick={exportiereZuExcel}
                    style={{
                        padding: '8px 15px',
                        backgroundColor: '#2ecc71',
                        color: 'white',
                        border: 'none',
                        borderRadius: '4px',
                        cursor: 'pointer'
                    }}
                >
                    📊 Excel Export
                </button>
               {/* <button
                    onClick={exportiereZuPDF}
                    style={{
                        padding: '8px 15px',
                        backgroundColor: '#e74c3c',
                        color: 'white',
                        border: 'none',
                        borderRadius: '4px',
                        cursor: 'pointer'
                    }}
                >
                    📄 PDF Export
                </button>*/}
            </div>

            {/* Statistik */}
            <div style={{
                marginBottom: '20px',
                padding: '15px',
                backgroundColor: '#f8f9fa',
                borderRadius: '5px'
            }}>
                <h3>Statistik</h3>
                <div style={{ display: 'flex', gap: '20px' }}>
                    <div>👤 Benutzer: {rollenZaehlung.user}</div>
                    <div>🛡️ Moderatoren: {rollenZaehlung.moderator}</div>
                    <div>👑 Administratoren: {rollenZaehlung.admin}</div>
                </div>
            </div>

            {/* Benutzertabelle */}
            <div style={{ overflowX: 'auto' }}>
                <table style={{
                    width: '100%',
                    borderCollapse: 'collapse',
                    marginBottom: '20px'
                }}>
                    <thead>
                    <tr style={{ backgroundColor: '#3498db', color: 'white' }}>
                        <th style={{ padding: '12px', textAlign: 'left' }}>Name</th>
                        <th style={{ padding: '12px', textAlign: 'left' }}>E-Mail</th>
                        <th style={{ padding: '12px', textAlign: 'left' }}>Telefon</th>
                        <th style={{ padding: '12px', textAlign: 'left' }}>Rolle</th>
                        <th style={{ padding: '12px', textAlign: 'left' }}>Aktionen</th>
                    </tr>
                    </thead>
                    <tbody>
                    {aktuelleBenutzer.map((u) => (
                        <tr key={u.id} style={{ borderBottom: '1px solid #ddd' }}>
                            <td style={{ padding: '12px' }}>
                                {bearbeiteBenutzerId === u.id ? (
                                    <input
                                        name="name"
                                        value={bearbeitungsFormular.name}
                                        onChange={handleBearbeitungsAenderung}
                                        style={{ padding: '5px', width: '100%' }}
                                    />
                                ) : u.name}
                            </td>
                            <td style={{ padding: '12px' }}>{u.email}</td>
                            <td style={{ padding: '12px' }}>
                                {bearbeiteBenutzerId === u.id ? (
                                    <input
                                        name="telefon"
                                        value={bearbeitungsFormular.telefon}
                                        onChange={handleBearbeitungsAenderung}
                                        style={{ padding: '5px', width: '100%' }}
                                    />
                                ) : u.phone}
                            </td>
                            <td style={{ padding: '12px' }}>
                                {bearbeiteBenutzerId === u.id ? (
                                    <select
                                        name="rolle"
                                        value={bearbeitungsFormular.rolle}
                                        onChange={handleBearbeitungsAenderung}
                                        style={{ padding: '5px', width: '100%' }}
                                    >
                                        <option value="user">Benutzer</option>
                                        <option value="moderator">Moderator</option>
                                        <option value="admin">Administrator</option>
                                    </select>
                                ) : u.role}
                            </td>
                            <td style={{ padding: '12px' }}>
                                {bearbeiteBenutzerId === u.id ? (
                                    <div style={{ display: 'flex', gap: '5px' }}>
                                        <button
                                            onClick={speichereBearbeitung}
                                            style={{
                                                padding: '5px 10px',
                                                backgroundColor: '#2ecc71',
                                                color: 'white',
                                                border: 'none',
                                                borderRadius: '3px',
                                                cursor: 'pointer'
                                            }}
                                        >
                                            Speichern
                                        </button>
                                        <button
                                            onClick={abbrechenBearbeitung}
                                            style={{
                                                padding: '5px 10px',
                                                backgroundColor: '#e74c3c',
                                                color: 'white',
                                                border: 'none',
                                                borderRadius: '3px',
                                                cursor: 'pointer'
                                            }}
                                        >
                                            Abbrechen
                                        </button>
                                    </div>
                                ) : (
                                    <div style={{ display: 'flex', gap: '5px' }}>
                                        <button
                                            onClick={() => starteBearbeitung(u)}
                                            style={{
                                                padding: '5px 10px',
                                                backgroundColor: '#3498db',
                                                color: 'white',
                                                border: 'none',
                                                borderRadius: '3px',
                                                cursor: 'pointer'
                                            }}
                                        >
                                            Bearbeiten
                                        </button>
                                        <button
                                            onClick={() => handleLoeschen(u.id)}
                                            style={{
                                                padding: '5px 10px',
                                                backgroundColor: '#e74c3c',
                                                color: 'white',
                                                border: 'none',
                                                borderRadius: '3px',
                                                cursor: 'pointer'
                                            }}
                                        >
                                            Löschen
                                        </button>
                                    </div>
                                )}
                            </td>
                        </tr>
                    ))}
                    </tbody>
                </table>
            </div>

            {/* Pagination */}
            <div style={{
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                gap: '15px',
                marginTop: '20px'
            }}>
                <button
                    onClick={vorherigeSeite}
                    disabled={aktuelleSeite === 1}
                    style={{
                        padding: '8px 15px',
                        backgroundColor: aktuelleSeite === 1 ? '#95a5a6' : '#3498db',
                        color: 'white',
                        border: 'none',
                        borderRadius: '4px',
                        cursor: aktuelleSeite === 1 ? 'not-allowed' : 'pointer'
                    }}
                >
                    Zurück
                </button>
                <span>
                    Seite {aktuelleSeite} von {seitenAnzahl}
                </span>
                <button
                    onClick={naechsteSeite}
                    disabled={aktuelleSeite === seitenAnzahl}
                    style={{
                        padding: '8px 15px',
                        backgroundColor: aktuelleSeite === seitenAnzahl ? '#95a5a6' : '#3498db',
                        color: 'white',
                        border: 'none',
                        borderRadius: '4px',
                        cursor: aktuelleSeite === seitenAnzahl ? 'not-allowed' : 'pointer'
                    }}
                >
                    Weiter
                </button>
            </div>
        </div>
    );
}