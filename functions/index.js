const functions = require('firebase-functions');
const admin = require('firebase-admin');
admin.initializeApp();

exports.onCreateMinutes =  functions.region('europe-west1')
                                    .firestore
                                    .document('minutes/{id}')
                                    .onCreate((snap, context) => {
                                      const minutes = snap.data();
                                      _saveActions(minutes);
                                      return true;
                                    });

exports.onUpdateMinutes =  functions.region('europe-west1')
                                    .firestore
                                    .document('minutes/{id}')
                                    .onUpdate((change, context) => {
                                      let oldMinutes = change.before.data();
                                      let newMinutes = change.after.data();
                                      _saveActions(newMinutes);
                                      oldMinutes.minutesId = oldMinutes.id;
                                      delete oldMinutes.id;
                                      admin.firestore().collection('minutesChanges').add(oldMinutes);
                                      return true;
                                    });

exports.onUpdateAction =  functions.region('europe-west1')
                                   .firestore
                                   .document('actions/{id}')
                                   .onUpdate((change, context) => {
                                      let action = change.before.data();
                                      action.actionId = action.id;
                                      delete action.id;
                                      admin.firestore().collection('actionChanges').add(action);
                                      return true;
                                   });




let _saveActions = (minutes) => {
  if (minutes.topics) {
    for (let topic of minutes.topics) {
      if(topic.items) {
        for (let item of topic.items) {
          if (item.actionBy !== 'none') {
              let action = {
              id: item.id,
              topicId: topic.id,
              meetingId: minutes.id,
              minutesRevision: minutes.revision,
              companyId: minutes.companyId,
              companyEmail: minutes.companyEmail,
              description: item.description,
              actionBy: item.actionBy,
              dueDate: item.dueDate,
              followupBy: item.followupBy,
              lastUpdated: minutes.lastUpdated,
              lastUpdatedBy: minutes.lastUpdatedBy,
            }
            _saveAction(action);
          }
        }
      }
    }
  }
}

let _saveAction = (action) => {
  admin.firestore().collection('actions').doc(action.id).get().then(doc => {
    if(!doc.exists) {
      action.status = 'Opened';
      action.statusComment = 'New Action Created';
      admin.firestore().collection('actions').doc(action.id).set(action);
    } else if (doc.data().description !== action.description || doc.data().actionBy !== action.actionBy || doc.data().followupBy !== action.followupBy || !doc.data().dueDate.isEqual(action.dueDate)) {
        action.status = 'Opened';
        action.statusComment = 'Action Details Changed';
        admin.firestore().collection('actions').doc(action.id).set(action, {merge: true});
    }
    return true;
  }).catch(err => {
    console.log(err);
  });
}
