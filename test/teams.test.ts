import { test } from 'node:test';
import assert from 'node:assert/strict';
import { meetingIdFromRef, meetingRefFromLink, threadIdFromMeetingId } from '../src/teams.js';

const thread = '19:meeting_YWJjZGVmMDEtMjM0NS02Nzg5LWFiY2QtZWYwMTIzNDU2Nzg5@thread.v2';
const oid = '11111111-2222-3333-4444-555555555555';

test('recap link wrapped in a launcher URL gives thread and organizer', () => {
  const inner = `/_#/l/meetingrecap?driveId=b!abc&organizerId=${oid}&threadId=${encodeURIComponent(thread)}&tenantId=x`;
  const link = `https://teams.microsoft.com/dl/launcher/launcher.html?url=${encodeURIComponent(inner)}&type=meetingrecap`;
  assert.deepEqual(meetingRefFromLink(link), { threadId: thread, organizerOid: oid });
});

test('join link with context gives thread and organizer', () => {
  const link = `https://teams.microsoft.com/l/meetup-join/${encodeURIComponent(thread)}/0?context=${encodeURIComponent(`{"Tid":"t","Oid":"${oid}"}`)}`;
  assert.deepEqual(meetingRefFromLink(link), { threadId: thread, organizerOid: oid });
});

test('a link without organizer is rejected', () => {
  assert.equal(meetingRefFromLink(`https://teams.microsoft.com/l/meetup-join/${encodeURIComponent(thread)}/0`), undefined);
});

test('meeting id round-trips to the thread id', () => {
  assert.equal(threadIdFromMeetingId(meetingIdFromRef({ threadId: thread, organizerOid: oid })), thread);
});
