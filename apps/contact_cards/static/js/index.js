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
      async loadContacts() {
        try {
          let response = await fetch(get_contacts_url);
          if (!response.ok) throw new Error('Failed to fetch contacts');
          let data = await response.json();
          this.contacts = data.contacts.map(contact => ({
            ...contact,
            editing: false
          }));
        } catch (error) {
          console.error(error);
        }
      },
      
      async addContact() {
        try {
          let response = await fetch(add_contact_url, { method: "POST" });
          if (!response.ok) throw new Error('Failed to add contact');
          let data = await response.json();
          this.contacts.push({ ...data.contact, editing: true });
          // Automatically scroll to the new contact
          this.$nextTick(() => {
            const newContact = this.$refs[`contact-${data.contact.id}`][0];
            if (newContact) newContact.scrollIntoView({ behavior: 'smooth' });
          });
        } catch (error) {
          console.error(error);
        }
      },
      
      async saveContact(contact) {
        if (!contact.editing) return;
        contact.editing = false;
        try {
          let response = await fetch(update_contact_url, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(contact)
          });
          if (!response.ok) throw new Error('Failed to save contact');
          let data = await response.json();
          if (!data.success) throw new Error('Save unsuccessful');
        } catch (error) {
          console.error(error);
        }
      },
      
      enableEditing(contact, field) {
        contact.editing = true;
      },
      
      async deleteContact(contact) {
        if (!confirm('Are you sure you want to delete this contact?')) return;
        try {
          let response = await fetch(delete_contact_url, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ id: contact.id })
          });
          if (!response.ok) throw new Error('Failed to delete contact');
          let data = await response.json();
          if (data.success) {
            this.contacts = this.contacts.filter(c => c.id !== contact.id);
          } else {
            throw new Error('Delete unsuccessful');
          }
        } catch (error) {
          console.error(error);
        }
      },
      
      clickFigure(contact) {
        const fileInput = document.getElementById(`file-input-${contact.id}`);
        if (fileInput) {
          fileInput.click();
        }
      },
      
      async onImageChange(event, contact) {
        const file = event.target.files[0];
        if (!file) return;
        try {
          const formData = new FormData();
          formData.append('file', file);
          
          let response = await fetch(upload_image_url, {
            method: 'POST',
            body: formData
          });
          if (!response.ok) throw new Error('Image upload failed');
          let data = await response.json();
          contact.contact_image = data.image_url;
          
          await this.saveContact(contact);
        } catch (error) {
          console.error(error);
        }
      }
    },
    async mounted() {
      await this.loadContacts();
    }
  };
  
  Vue.createApp(app).mount("#app");

