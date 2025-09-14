-- 导入交路票夹（drive_ticket_collect）

INSERT OR REPLACE INTO drive_ticket_collect (id, collect_id, ticket_chain) VALUES (1, 1, '1->3->5->7');
INSERT OR REPLACE INTO drive_ticket_collect (id, collect_id, ticket_chain) VALUES (2, 2, '2->4->6=>[退勤便1]10:[退勤便2]25:[退勤便3]26');
INSERT OR REPLACE INTO drive_ticket_collect (id, collect_id, ticket_chain) VALUES (3, 3, '[出勤便1]6:[出勤便2]4=>8->10->12=>[退勤便]18');
INSERT OR REPLACE INTO drive_ticket_collect (id, collect_id, ticket_chain) VALUES (4, 4, '9->11->13->15');
INSERT OR REPLACE INTO drive_ticket_collect (id, collect_id, ticket_chain) VALUES (5, 5, '[出勤便1]14:[出勤便2]12=>14->16');
INSERT OR REPLACE INTO drive_ticket_collect (id, collect_id, ticket_chain) VALUES (6, 6, '17=>[退勤便1]25:[退勤便2]26');
INSERT OR REPLACE INTO drive_ticket_collect (id, collect_id, ticket_chain) VALUES (7, 7, '18');
INSERT OR REPLACE INTO drive_ticket_collect (id, collect_id, ticket_chain) VALUES (8, 8, '[出勤便1]20:[出勤便2]6:[出勤便3]4=>19->21');
INSERT OR REPLACE INTO drive_ticket_collect (id, collect_id, ticket_chain) VALUES (9, 9, '[出勤便1]20:[出勤便2]6:[出勤便3]4=>20->22');
INSERT OR REPLACE INTO drive_ticket_collect (id, collect_id, ticket_chain) VALUES (10, 10, '23');
INSERT OR REPLACE INTO drive_ticket_collect (id, collect_id, ticket_chain) VALUES (11, 11, '24');
