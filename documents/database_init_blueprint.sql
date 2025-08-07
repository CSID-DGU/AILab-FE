CREATE TABLE `ContainerImage` (
	`image_name`	VARCHAR(100)	NOT NULL,
	`image_version`	VARCHAR(100)	NOT NULL
);

CREATE TABLE `Requests` (
	`request_id`	LONG	NOT NULL,
	`user_id`	LONG	NOT NULL,
	`node_id`	VARCHAR(100)	NOT NULL,
	`image_name`	VARCHAR(100)	NOT NULL,
	`image_version`	VARCHAR(100)	NOT NULL,
	`ubuntu_gid`	LONG	NULL,
	`ubuntu_username`	VARCHAR(100)	NULL,
	`expires_at`	TIMESTAMP	NOT NULL,
	`volume_size_byte`	LONG	NOT NULL,
	`cuda_version`	VARCHAR(100)	NOT NULL,
	`usage_purpose`	VARCHAR(1000)	NOT NULL,
	`form_answers`	JSON	NOT NULL,
	`approved_at`	TIMESTAMP	NULL	COMMENT '허가받은 경우 NOT NULL',
	`status`	ENUM	NOT NULL	DEFAULT PENDING	COMMENT 'PENDING, DENIED, FULFILLED',
	`comment`	VARCHAR(300)	NULL	COMMENT 'status에 대한 설명 (거절 사유 등)',
	`created_at`	TIMESTAMP	NOT NULL	DEFAULT CURRENT_TIMESTAMP,
	`updated_at`	TIMESTAMP	NOT NULL	DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE `Users` (
	`user_id`	LONG	NOT NULL,
	`email`	VARCHAR(100)	NOT NULL,
	`password`	VARCHAR(255)	NOT NULL,
	`ubuntu_uid`	LONG	NULL,
	`name`	VARCHAR(100)	NOT NULL	COMMENT '해당 유저의 '실명'',
	`role`	ENUM	NOT NULL	DEFAULT USER	COMMENT 'USER, ADMIN',
	`student_id`	VARCHAR(100)	NOT NULL,
	`phone`	VARCHAR(100)	NOT NULL,
	`department`	VARCHAR(100)	NOT NULL,
	`created_at`	TIMESTAMP	NULL	DEFAULT CURRENT_TIMESTAMP,
	`updated_at`	TIMESTAMP	NULL	DEFAULT CURRENT_TIMESTAMP,
	`is_active`	BOOLEAN	NOT NULL	DEFAULT TRUE
);

CREATE TABLE `Nodes` (
	`node_id`	VARCHAR(100)	NOT NULL	COMMENT 'ex. LAB1, FARM2',
	`rsgroup_id`	LONG	NOT NULL,
	`memory_size_GB`	INT	NOT NULL,
	`CPU_core_count`	INT	NOT NULL
);

CREATE TABLE `GPUs` (
	`gpu_id`	LONG	NOT NULL	COMMENT '식별용 ID',
	`node_id`	VARCHAR(100)	NOT NULL,
	`gpu_model`	VARCHAR(100)	NOT NULL	COMMENT 'ex. RTX4050, A3000',
	`RAM_GB`	INT	NOT NULL
);

CREATE TABLE `ResourceGroups` (
	`rsgroup_id`	INT	NOT NULL,
	`description`	VARCHAR(500)	NULL
);

CREATE TABLE `Groups` (
	`ubuntu_gid`	LONG	NOT NULL,
	`group_name`	VARCHAR(100)	NOT NULL
);

ALTER TABLE `ContainerImage` ADD CONSTRAINT `PK_CONTAINERIMAGE` PRIMARY KEY (
	`image_name`,
	`image_version`
);

ALTER TABLE `Requests` ADD CONSTRAINT `PK_REQUESTS` PRIMARY KEY (
	`request_id`,
	`user_id`,
	`node_id`
);

ALTER TABLE `Users` ADD CONSTRAINT `PK_USERS` PRIMARY KEY (
	`user_id`
);

ALTER TABLE `Nodes` ADD CONSTRAINT `PK_NODES` PRIMARY KEY (
	`node_id`,
	`rsgroup_id`
);

ALTER TABLE `GPUs` ADD CONSTRAINT `PK_GPUS` PRIMARY KEY (
	`gpu_id`,
	`node_id`
);

ALTER TABLE `ResourceGroups` ADD CONSTRAINT `PK_RESOURCEGROUPS` PRIMARY KEY (
	`rsgroup_id`
);

ALTER TABLE `Groups` ADD CONSTRAINT `PK_GROUPS` PRIMARY KEY (
	`ubuntu_gid`
);

ALTER TABLE `Requests` ADD CONSTRAINT `FK_Users_TO_Requests_1` FOREIGN KEY (
	`user_id`
)
REFERENCES `Users` (
	`user_id`
);

ALTER TABLE `Requests` ADD CONSTRAINT `FK_Nodes_TO_Requests_1` FOREIGN KEY (
	`node_id`
)
REFERENCES `Nodes` (
	`node_id`
);

ALTER TABLE `Nodes` ADD CONSTRAINT `FK_ResourceGroups_TO_Nodes_1` FOREIGN KEY (
	`rsgroup_id`
)
REFERENCES `ResourceGroups` (
	`rsgroup_id`
);

ALTER TABLE `GPUs` ADD CONSTRAINT `FK_Nodes_TO_GPUs_1` FOREIGN KEY (
	`node_id`
)
REFERENCES `Nodes` (
	`node_id`
);

