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
        get_contacts_url=URL('get_contacts'),
        add_contact_url=URL('add_contact'),
        update_contact_url=URL('update_contact'),
        delete_contact_url=URL('delete_contact'),
    )

@action('get_contacts')
@action.uses(db, auth.user)
def get_contacts():
    user_email = get_user_email()
    contacts = db(db.contact_card.user_email == user_email).select().as_list()
    return dict(contacts=contacts)

@action('add_contact', method="POST")
@action.uses(db, auth.user)
def add_contact():
    user_email = get_user_email()
    contact_id = db.contact_card.insert(user_email=user_email)
    contact = db.contact_card[contact_id]
    return dict(contact=contact.as_dict())

@action('update_contact', method="POST")
@action.uses(db, auth.user)
def update_contact():
    user_email = get_user_email()
    contact_id = request.json.get("id")
    contact = db.contact_card[contact_id]
    if contact and contact.user_email == user_email:
        contact.update_record(
            contact_name=request.json.get("contact_name"),
            contact_affiliation=request.json.get("contact_affiliation"),
            contact_description=request.json.get("contact_description"),
            contact_image=request.json.get("contact_image")
        )
        return dict(success=True)
    else:
        abort(403)

@action('delete_contact', method="POST")
@action.uses(db, auth.user)
def delete_contact():
    user_email = get_user_email()
    contact_id = request.json.get("id")
    contact = db.contact_card[contact_id]
    if contact and contact.user_email == user_email:
        contact.delete_record()
        return dict(success=True)
    else:
        abort(403)