import { useEffect, useState } from "react";
import api from "../../api/api";
import toast from "react-hot-toast";

export default function CreditNotesPage() {

    const [credits, setCredits] = useState([]);
    const [form,setForm] = useState({
        client_name:"",
        phone:"",
        amount:"",
        type:"debt",
        reason:""
    });

    const loadCredits = async () => {
        const res = await api.get("/credit-notes");
        setCredits(res.data.data || []);
    };

    useEffect(() => {
        loadCredits();
    }, []);

    const markPaid = async (id) => {
        await api.patch(`/credit-notes/${id}/paid`);
        toast.success("Créance réglée");
        loadCredits();
    };

    const submit = async () => {
        await api.post("/credit-notes",form);
        toast.success("Créance ajoutée");
        loadCredits();
    };

    return (

        <div className="p-6">
            <h1 className="text-xl font-semibold mb-4">
                Ajouter des créances
            </h1>

            <div className="bg-white p-4 rounded shadow mb-6">

                <div className="grid grid-cols-5 gap-3">

                <input
                    placeholder="Client"
                    className="border p-2 rounded"
                    onChange={e=>setForm({...form,client_name:e.target.value})}
                />

                <input
                    placeholder="Téléphone"
                    className="border p-2 rounded"
                    onChange={e=>setForm({...form,phone:e.target.value})}
                />

                <input
                    placeholder="Montant"
                    type="number"
                    className="border p-2 rounded"
                    onChange={e=>setForm({...form,amount:e.target.value})}
                />

                <select
                    className="border p-2 rounded"
                    onChange={e=>setForm({...form,type:e.target.value})}
                >

                <option value="debt">
                    Créance
                </option>

                <option value="credit">
                    Avoir
                </option>

                </select>

                <button
                    onClick={submit}
                    className="bg-green-600 text-white rounded"
                >
                    Enregistrer
                </button>

                </div>

            </div>

            <h1 className="text-xl font-semibold mb-4">
                Gestion des créances clients
            </h1>

            <table className="w-full text-sm">

                <thead className="border-b">
                    <tr>
                        <th className="text-left">Client</th>
                        <th>Montant</th>
                        <th>Type</th>
                        <th>Statut</th>
                        <th></th>
                    </tr>
                </thead>

                <tbody>
                    {credits.map(c => (
                        <tr key={c.id} className="border-b">
                            <td>{c.client_name}</td>
                            <td>
                                {Number(c.amount).toLocaleString()} Ar
                            </td>

                            <td>
                                {c.type === "credit" ? "Avoir" : "Créance"}
                            </td>

                            <td>
                                {c.status}
                            </td>

                            <td>
                                {c.status === "pending" && (
                                    <button
                                        onClick={() => markPaid(c.id)}
                                        className="text-green-600"
                                    >
                                        Marquer payé
                                    </button>
                                )}
                            </td>
                        </tr>

                    ))}

                </tbody>
            </table>

        </div>
    );
}