const functions = require('firebase-functions');
const admin = require('firebase-admin');
admin.initializeApp();

exports.onCreateMinutes =  functions.region('europe-west1')
                                    .firestore
                                    .document('minutes/{id}')
                                    .onCreate((snap, context) => {
                                      const minutes = snap.data();
                                      _saveActions(minutes, true);
                                      return true;
                                    });

exports.onUpdateMinutes =  functions.region('europe-west1')
                                    .firestore
                                    .document('minutes/{id}')
                                    .onUpdate((change, context) => {
                                      let oldMinutes = change.before.data();
                                      let newMinutes = change.after.data();
                                      _saveActions(newMinutes, false);
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




let _saveActions = (minutes, isNew) => {
  if (minutes.topics) {
    for (let topic of minutes.topics) {
      if(topic.items) {
        for (let item of topic.items) {
          if (item.actionBy !== 'none') {
            if(isNew) {
              let action = {
                id: item.id,
                topicId: topic.id,
                meetingId: minutes.id,
                companyId: minutes.companyId,
                companyEmail: minutes.companyEmail,
                description: item.description,
                actionBy: item.actionBy,
                dueDate: item.dueDate,
                followupBy: item.followupBy,
                status: 'OPENED',
                statusComment: 'For Your Action',
                lastUpdated: minutes.lastUpdated,
                lastUpdatedBy: minutes.lastUpdatedBy,
              }
              admin.firestore().collection('actions').doc(item.id).set(action);
            } else {
              let action = {
                id: item.id,
                topicId: topic.id,
                meetingId: minutes.id,
                companyId: minutes.companyId,
                companyEmail: minutes.companyEmail,
                description: item.description,
                actionBy: item.actionBy,
                dueDate: item.dueDate,
                followupBy: item.followupBy,
                lastUpdated: minutes.lastUpdated,
                lastUpdatedBy: minutes.lastUpdatedBy,
              }
              admin.firestore().collection('actions').doc(item.id).set(action, {merge: true});
            }

          }
        }
      }
    }
  }
}
