"""
This file defines actions, i.e. functions the URLs are mapped into
The @action(path) decorator exposed the function at URL:

    http://127.0.0.1:8000/{app_name}/{path}

If app_name == '_default' then simply

    http://127.0.0.1:8000/{path}

If path == 'index' it can be omitted:

    http://127.0.0.1:8000/

The path follows the bottlepy syntax.

@action.uses('generic.html')  indicates that the action uses the generic.html template
@action.uses(session)         indicates that the action uses the session
@action.uses(db)              indicates that the action uses the db
@action.uses(T)               indicates that the action uses the i18n & pluralization
@action.uses(auth.user)       indicates that the action requires a logged in user
@action.uses(auth)            indicates that the action requires the auth object

session, db, T, auth, and tempates are examples of Fixtures.
Warning: Fixtures MUST be declared with @action.uses({fixtures}) else your app will result in undefined behavior
"""

from py4web import action, request, abort, redirect, URL
from yatl.helpers import A
from .common import db, session, T, cache, auth, logger, authenticated, unauthenticated, flash
from .models import get_user_email


@action('index')
@action.uses('index.html', db, auth.user)
def index():
    return dict(
        get_contacts_url = URL('get_contacts'),
        add_contact_url = URL('add_contact'),
        update_contact_url = URL('update_contact'),
        delete_contact_url = URL('delete_contact'),
        upload_image_url = URL('upload_image'),
    )

@action('get_contacts', method='GET')
@action.uses(db, auth.user)
def get_contacts():
    user_email = get_user_email()
    contacts= db(db.contact_card.user_email == user_email).select().as_list()
    return dict(contacts=contacts)

@action('add_contact', method='POST')
@action.uses(db, auth.user)
def add_contact():
    user_email = get_user_email()
    contact_id = db.contact_card.insert(
        user_email = user_email,
        contact_image = "https://bulma.io/assets/images/placeholders/96x96.png"
    )
    contact = db.contact_card[contact_id]
    return dict(contact=contact.as_dict())

@action('update_contact', method='POST')
@action.uses(db, auth.user)
def update_contact():
    try:
        data = request.json
        contact_id = data.get('id')
        user_email = get_user_email()
        contact = db.contact_card[contact_id]
        
        if not contact or contact.user_email != user_email:
            abort(403, "Forbidden")
        
        update_fields = {}
        if 'contact_name' in data:
            update_fields['contact_name'] = data['contact_name']
        if 'contact_affiliation' in data:
            update_fields['contact_affiliation'] = data['contact_affiliation']
        if 'contact_description' in data:
            update_fields['contact_description'] = data['contact_description']
        if 'contact_image' in data:
            update_fields['contact_image'] = data['contact_image']
        
        db(db.contact_card.id == contact_id).update(**update_fields)
        db.commit()
        
        return dict(success=True)
    except Exception as e:
        logger.error(f"Error updating contact: {e}")
        abort(500, "Internal Server Error")

@action('delete_contact', method='POST')
@action.uses(db, auth.user)
def delete_contact():
    try:
        data = request.json
        contact_id = data.get('id')
        user_email = get_user_email()
        contact = db.contact_card[contact_id]
        
        if not contact or contact.user_email != user_email:
            abort(403, "Forbidden")
        
        db(db.contact_card.id == contact_id).delete()
        db.commit()
        
        return dict(success=True)
    except Exception as e:
        logger.error(f"Error deleting contact: {e}")
        abort(500, "Internal Server Error")

@action('upload_image', method='POST')
@action.uses(db, auth.user)
def upload_image():
    try:
        file = request.files.get('file')
        if not file:
            abort(400, "No file uploaded")
        
        import base64
        data = file.read()
        encoded_image = base64.b64encode(data).decode('utf-8')
        mime_type = file.content_type
        data_url = f"data:{mime_type};base64,{encoded_image}"
        
        return dict(image_url=data_url)
    except Exception as e:
        logger.error(f"Error uploading image: {e}")
        abort(500, "Internal Server Error")