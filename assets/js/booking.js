document.addEventListener("DOMContentLoaded", () => {
    const bookingForm = document.getElementById("bookingForm");
    const tipoTavolo = document.getElementById("tipo_tavolo");
    const numeroPersone = document.getElementById("numero_persone");
    const dataPrenotazione = document.getElementById("data_prenotazione");

    const telefonoPrefisso = document.getElementById("telefono_prefisso");
    const telefonoNumero = document.getElementById("telefono_numero");

    const submitBtn = document.getElementById("submitBtn");
    const downloadPdfBtn = document.getElementById("downloadPdfBtn");

    const summaryTable = document.getElementById("summaryTable");
    const summaryPeople = document.getElementById("summaryPeople");
    const summaryPrice = document.getElementById("summaryPrice");
    const formMessage = document.getElementById("formMessage");

    const today = new Date().toISOString().split("T")[0];
    dataPrenotazione.min = today;

    const telefonoRegex = /^\d{10}$/;
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    // METTI QUI I TUOI LINK STRIPE VERI
    const STRIPE_LINKS = {
        1: "https://buy.stripe.com/test_00w7sM82q5BadxP3vl2Nq01",
        2: "https://buy.stripe.com/test_bJebJ2fuSfbK51j2rh2Nq02",
        3: "https://buy.stripe.com/test_4gMaEYfuS9Rq65n2rh2Nq03"
    };

    function setMessage(message, type = "") {
        formMessage.textContent = message;
        formMessage.className = "booking-page__message";
        if (type) {
            formMessage.classList.add(type);
        }
    }

    function resetFieldState(field) {
        field.classList.remove("input-error", "input-valid");
    }

    function setFieldError(field) {
        field.classList.remove("input-valid");
        field.classList.add("input-error");
    }

    function setFieldValid(field) {
        field.classList.remove("input-error");
        field.classList.add("input-valid");
    }

    function sanitizePhoneInput() {
        telefonoNumero.value = telefonoNumero.value.replace(/\D/g, "").slice(0, 10);
    }

    function getSelectedBookingData() {
        const selectedOption = tipoTavolo.options[tipoTavolo.selectedIndex];
        const people = parseInt(numeroPersone.value, 10) || 0;

        if (!selectedOption || !selectedOption.value) {
            return null;
        }

        const prezzo = parseFloat(selectedOption.dataset.prezzo);
        const nomeTavolo = selectedOption.textContent.split(" - ")[0];
        const prezzoPerPersona = people > 0 ? (prezzo / people).toFixed(2) : null;

        return {
            nomeTavolo,
            people,
            prezzo,
            prezzoPerPersona
        };
    }

    function updateSummary() {
        const bookingData = getSelectedBookingData();

        if (!bookingData) {
            summaryTable.textContent = "-";
            summaryPeople.textContent = "-";
            summaryPrice.textContent = "-";
            return;
        }

        summaryTable.textContent = bookingData.nomeTavolo;
        summaryPeople.textContent = bookingData.people || "-";
        summaryPrice.textContent = bookingData.people > 0
            ? `€${bookingData.prezzo} (€${bookingData.prezzoPerPersona}/persona)`
            : `€${bookingData.prezzo}`;
    }

    function validateFormFields({ nome, email, prefisso, telefono, data, persone, tavoloOption }) {
        let isValid = true;

        const nomeField = document.getElementById("nome");
        const emailField = document.getElementById("email");
        const prefissoField = telefonoPrefisso;
        const telefonoField = telefonoNumero;
        const dataField = dataPrenotazione;
        const personeField = numeroPersone;
        const tavoloField = tipoTavolo;

        [
            nomeField,
            emailField,
            prefissoField,
            telefonoField,
            dataField,
            personeField,
            tavoloField
        ].forEach(resetFieldState);

        if (!nome || nome.length < 3) {
            setFieldError(nomeField);
            isValid = false;
        } else {
            setFieldValid(nomeField);
        }

        if (!emailRegex.test(email)) {
            setFieldError(emailField);
            isValid = false;
        } else {
            setFieldValid(emailField);
        }

        if (!prefisso) {
            setFieldError(prefissoField);
            isValid = false;
        } else {
            setFieldValid(prefissoField);
        }

        if (!telefonoRegex.test(telefono)) {
            setFieldError(telefonoField);
            isValid = false;
        } else {
            setFieldValid(telefonoField);
        }

        if (!data) {
            setFieldError(dataField);
            isValid = false;
        } else {
            setFieldValid(dataField);
        }

        if (!persone || persone < 1) {
            setFieldError(personeField);
            isValid = false;
        } else {
            setFieldValid(personeField);
        }

        if (!tavoloOption || !tavoloOption.value) {
            setFieldError(tavoloField);
            isValid = false;
        } else {
            setFieldValid(tavoloField);
        }

        return isValid;
    }

    function downloadPDF() {
        const nome = document.getElementById("nome").value.trim() || "-";
        const email = document.getElementById("email").value.trim() || "-";
        const telefonoCompleto = `${telefonoPrefisso.value} ${telefonoNumero.value || "-"}`;
        const data = dataPrenotazione.value || "-";
        const note = document.getElementById("note").value.trim() || "-";
        const bookingData = getSelectedBookingData();

        if (!bookingData) {
            setMessage("Seleziona almeno un tavolo prima di scaricare il PDF.", "error");
            return;
        }

        const { jsPDF } = window.jspdf;
        const doc = new jsPDF();

        doc.setFont("helvetica", "bold");
        doc.setFontSize(22);
        doc.text("InfoStudio-54", 20, 20);

        doc.setFontSize(16);
        doc.text("Riepilogo prenotazione", 20, 35);

        doc.setFont("helvetica", "normal");
        doc.setFontSize(12);

        let y = 55;
        const rows = [
            `Nome: ${nome}`,
            `Email: ${email}`,
            `Telefono: ${telefonoCompleto}`,
            `Data prenotazione: ${data}`,
            `Tavolo: ${bookingData.nomeTavolo}`,
            `Numero persone: ${bookingData.people}`,
            `Prezzo totale: €${bookingData.prezzo}`,
            `Prezzo per persona: €${bookingData.prezzoPerPersona || "-"}`,
            `Note: ${note}`
        ];

        rows.forEach((row) => {
            doc.text(row, 20, y);
            y += 10;
        });

        doc.save("riepilogo-prenotazione.pdf");
    }

    telefonoNumero.addEventListener("input", sanitizePhoneInput);
    tipoTavolo.addEventListener("change", updateSummary);
    numeroPersone.addEventListener("input", updateSummary);

    telefonoNumero.addEventListener("blur", () => {
        if (!telefonoNumero.value) {
            resetFieldState(telefonoNumero);
            return;
        }

        if (telefonoRegex.test(telefonoNumero.value)) {
            setFieldValid(telefonoNumero);
        } else {
            setFieldError(telefonoNumero);
        }
    });

    downloadPdfBtn.addEventListener("click", downloadPDF);

    submitBtn.addEventListener("click", async () => {
        setMessage("");

        const nome = document.getElementById("nome").value.trim();
        const email = document.getElementById("email").value.trim();
        const prefisso = telefonoPrefisso.value;
        const telefono = telefonoNumero.value.trim();
        const data = dataPrenotazione.value;
        const persone = parseInt(numeroPersone.value, 10);
        const tavoloOption = tipoTavolo.options[tipoTavolo.selectedIndex];

        const isValid = validateFormFields({
            nome,
            email,
            prefisso,
            telefono,
            data,
            persone,
            tavoloOption
        });

        if (!isValid) {
            setMessage("Compila correttamente tutti i campi prima di procedere.", "error");
            return;
        }

        const maxPersone = parseInt(tavoloOption.dataset.max, 10);

        if (persone > maxPersone) {
            setFieldError(numeroPersone);
            setMessage(`Questo tavolo accetta al massimo ${maxPersone} persone.`, "error");
            return;
        }

        if (!window.supabaseClient || !window.supabaseClient.auth) {
            setMessage("Client Supabase non inizializzato correttamente.", "error");
            return;
        }

        const {
            data: { user },
            error: userError
        } = await window.supabaseClient.auth.getUser();

        if (userError || !user) {
            setMessage("Devi effettuare il login prima di andare al pagamento.", "error");
            return;
        }

        const tavoloId = parseInt(tavoloOption.value, 10);
        const stripeUrl = STRIPE_LINKS[tavoloId];

        if (!stripeUrl) {
            setMessage("Link di pagamento non configurato per questo tavolo.", "error");
            return;
        }

        window.location.href = stripeUrl;
    });

    updateSummary();
});