const functions = require('firebase-functions');
const admin = require('firebase-admin');
admin.initializeApp();

exports.onCreateMinutes =  functions.region('europe-west1')
                                    .firestore
                                    .document('minutes/{id}')
                                    .onCreate((snap, context) => {
                                      const minutes = snap.data();
                                      if (minutes.topics) {
                                        for (let topic of minutes.topics) {
                                          if(topic.items) {
                                            for (let item of topic.items) {
                                              if (item.actionBy !== 'none') {
                                                let action = {
                                                  id: item.id,
                                                  topicId: topic.id,
                                                  meetingId: minutes.meetingId,
                                                  companyId: minutes.companyId,
                                                  companyEmail: minutes.companyEmail,
                                                  description: item.description,
                                                  actionBy: item.actionBy,
                                                  dueDate: item.dueDate,
                                                  status: 'OPENED',
                                                  lastUpdated: minutes.lastUpdated,
                                                  lastUpdatedBy: minutes.lastUpdatedBy,
                                                }
                                                admin.firestore().doc(`actions/${item.id}`).set(action);
                                              }
                                            }
                                          }
                                        }
                                      }
                                      return true;
                                    });
