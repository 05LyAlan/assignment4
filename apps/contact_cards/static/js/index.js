"use strict";

// This will be the object that will contain the Vue attributes
// and be used to initialize it.
let app = {};

app.data = function () {
    return {
        contacts: []
    };
};

app.methods = {
    loadContacts() {
        fetch(get_contacts_url)
            .then(response => response.json())
            .then(data => this.contacts = data.contacts);
    },
    addContact() {
        fetch(add_contact_url, {method: "POST"})
            .then(response => response.json())
            .then(data => {
                this.contacts.push({
                    id: data.id,
                    contact_name: "",
                    contact_affiliation: "",
                    contact_description: "",
                    contact_image: "https://bulma.io/assets/images/placeholders/96x96.png"
                });
            });
    },
    deleteContact(contactId) {
        fetch(delete_contact_url, {
            method: "POST",
            headers: {"Content-Type": "application/json"},
            body: JSON.stringify({id: contactId})
        }).then(() => {
            this.contacts = this.contacts.filter(contact => contact.id !== contactId);
        });
    },
    enableEditing(contact, field) {
        contact[field] = true;
    },
    saveContact(contact, fieldName) {
        let fieldValue = contact[fieldName];
        fetch(update_contact_url, {
            method: "POST",
            headers: {"Content-Type": "application/json"},
            body: JSON.stringify({id: contact.id, field: fieldName, value: fieldValue})
        });
        contact[`editing${fieldName.charAt(0).toUpperCase() + fieldName.slice(1)}`] = false;
    },
    openImageDialog(index) {
        this.$refs.fileInput[index].click();
    },
    uploadImage(event, contact) {
        const file = event.target.files[0];
        const reader = new FileReader();
        reader.onloadend = () => {
            contact.contact_image = reader.result;
            this.saveContact(contact, 'contact_image');
        };
        if (file) reader.readAsDataURL(file);
    }
};

app.vue = Vue.createApp({
    data: app.data,
    methods: app.methods,
    mounted() {
        this.loadContacts();
    }
}).mount("#app");