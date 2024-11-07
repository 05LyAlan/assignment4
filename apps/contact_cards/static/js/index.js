"use strict";

// This will be the object that will contain the Vue attributes
// and be used to initialize it.
let app = {
    data() {
        return {
            contacts: [],
        };
    },
    methods: {
        loadContacts() {
            axios.get(get_contacts_url).then(response => {
                this.contacts = response.data.contacts.map(contact => ({
                    ...contact,
                    editing: { contact_name: false, contact_affiliation: false, contact_description: false }
                }));
            });
        },
        addContact() {
            axios.post(add_contact_url).then(response => {
                this.contacts.push({
                    ...response.data.contact,
                    editing: { contact_name: false, contact_affiliation: false, contact_description: false }
                });

                this.loadContacts();
            });
        },
        editField(contact, field) {
            contact.editing[field] = true;
        },
        saveField(contact, field) {
            contact.editing[field] = false;
            axios.post(update_contact_url, contact);
        },
        chooseImage(contact) {
            let input = document.getElementById("file-input");
            input.onchange = () => {
                let file = input.files[0];
                if (file) {
                    let reader = new FileReader();
                    reader.onload = e => {
                        contact.contact_image = e.target.result;
                        axios.post(update_contact_url, contact);
                    };
                    reader.readAsDataURL(file);
                }
            };
            input.click();
        },
        deleteContact(contact) {
            axios.post(delete_contact_url, { id: contact.id }).then(() => {
                this.contacts = this.contacts.filter(c => c.id !== contact.id);
            });
        }
    }
};

app.mounted = function() {
    this.loadContacts();
};

Vue.createApp(app).mount("#app");