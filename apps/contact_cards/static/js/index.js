"use strict";

// This will be the object that will contain the Vue attributes
// and be used to initialize it.
let app = {};

app.data = function() {
    return {
        contacts: [],
    };
};

app.methods = {
    loadContacts() {
        axios.get(get_contacts_url)
        .then(response => {
            this.contacts = response.data.contacts.map(contact => ({
                ...contact,
                editing: { 
                    contact_name: false, 
                    contact_affiliation: false, 
                    contact_description: false 
                }
            }));
        })
        .catch(error => {
            console.error("Error loading contacts:", error);
        });
    },
    addContact() {
        axios.post(add_contact_url).then(response => {
            this.contacts.push({
                id: response.data.contact_id,
                contact_name: "",
                contact_affiliation: "",
                contact_description: "",
                contact_image: "https://bulma.io/assets/images/placeholders/96x96.png",
                editing: { 
                    contact_name: false, 
                    contact_affiliation: false, 
                    contact_description: false 
                }
            });
        });
    },
    deleteContact(contact_id) {
        axios.post(delete_contact_url, { id: contact_id }).then(response => {
            if (response.data.success) {
                this.contacts = this.contacts.filter(contact => contact.id !== contact_id);
            }
        });
    },
    editable(contact, field) {
        contact.editing[field] = true;
    },
    save(contact, field) {
        contact.editing[field] = false;
        
        // Debugging: Check the value being saved
        console.log(`Saving ${field} for contact ${contact.id} with value: ${contact[field]}`);
        
        axios.post(update_contact_url, {
            id: contact.id,
            field: field,
            value: contact[field]  // Send the updated field value to the backend
        }).then(response => {
            if (response.data.success) {
                console.log(`Successfully updated ${field}`);
            } else {
                console.error(`Failed to update ${field}`);
            }
        }).catch(error => {
            console.error("Error saving contact:", error);
        });
    },
    clickFigure(contact_id) {
        this.$refs['fileInput' + contact_id][0].click();
    },
    updateImage(contact_id, event) {
        let file = event.target.files[0];
        let reader = new FileReader();
        reader.onload = (e) => {
            axios.post(update_contact_url, { id: contact_id, field: "contact_image", value: e.target.result }).then(response => {
                if (response.data.success) {
                    let contact = this.contacts.find(contact => contact.id === contact_id);
                    contact.contact_image = e.target.result;
                }
            });
        };
        reader.readAsDataURL(file);
    }
};

app.mounted = function() {
    this.loadContacts();
};

Vue.createApp(app).mount("#app");