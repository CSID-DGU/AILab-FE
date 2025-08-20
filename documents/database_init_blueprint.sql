CREATE TABLE
	`Requests` (
		`request_id` BIGINT NOT NULL,
		`user_id` BIGINT NOT NULL,
		`rsgroup_id` INT NOT NULL COMMENT '리소스 그룹 ID',
		`image_id` BIGINT NOT NULL COMMENT '컨테이너 이미지 ID',
		`ubuntu_username` VARCHAR(100) NOT NULL,
		`ubuntu_password` VARCHAR(500) NULL,
		`ubuntu_uid` BIGINT NOT NULL COMMENT 'ubuntu_uid',
		`volume_size_GB` BIGINT NOT NULL,
		`expires_at` TIMESTAMP NOT NULL,
		`usage_purpose` VARCHAR(1000) NOT NULL,
		`form_answers` JSON NOT NULL,
		`approved_at` TIMESTAMP NOT NULL COMMENT '허가받은 경우 NOT NULL',
		`status` ENUM('PENDING', 'DENIED', 'FULFILLED') NOT NULL DEFAULT 'PENDING' COMMENT 'PENDING, DENIED, FULFILLED',
		`admin_comment` VARCHAR(500) NULL COMMENT 'status에 대한 설명 (거절 사유 등)',
		`created_at` TIMESTAMP NOT NULL,
		`updated_at` TIMESTAMP NOT NULL
	);

CREATE TABLE
	`ContainerImages` (
		`image_id` BIGINT NOT NULL,
		`image_name` VARCHAR(100) NOT NULL,
		`image_version` VARCHAR(100) NOT NULL,
		`cuda_version` VARCHAR(100) NOT NULL COMMENT 'ex. 11.8, 12.0',
		`description` VARCHAR(500) NULL,
		`created_at` TIMESTAMP NOT NULL
	);

CREATE TABLE
	`Groups` (
		`ubuntu_gid` BIGINT NOT NULL,
		`group_name` VARCHAR(100) NOT NULL
	);

CREATE TABLE
	`ResourceGroups` (
		`rsgroup_id` INT NOT NULL,
		`description` VARCHAR(500) NULL,
		`server_name` VARCHAR(300) NULL
	);

CREATE TABLE
	`UsedIds` (`id_value` BIGINT NOT NULL COMMENT 'UID 또는 GID 값');

CREATE TABLE
	`Users` (
		`user_id` BIGINT NOT NULL,
		`email` VARCHAR(100) NOT NULL,
		`password` VARCHAR(255) NOT NULL,
		`name` VARCHAR(100) NOT NULL COMMENT '해당 유저의 실명',
		`role` ENUM('USER', 'ADMIN') NOT NULL DEFAULT 'USER' COMMENT 'USER, ADMIN',
		`student_id` VARCHAR(100) NOT NULL,
		`phone` VARCHAR(100) NOT NULL,
		`department` VARCHAR(100) NOT NULL,
		`created_at` TIMESTAMP NULL,
		`updated_at` TIMESTAMP NULL,
		`is_active` BOOLEAN NOT NULL
	);

CREATE TABLE
	`GPUs` (
		`gpu_id` BIGINT NOT NULL,
		`node_id` VARCHAR(100) NOT NULL,
		`gpu_model` VARCHAR(100) NOT NULL COMMENT 'ex. RTX4050, A3000',
		`RAM_GB` INT NOT NULL
	);

CREATE TABLE
	`RequestGroups` (
		`request_id` BIGINT NOT NULL,
		`ubuntu_gid` BIGINT NOT NULL,
		`created_at` TIMESTAMP NOT NULL
	);

CREATE TABLE
	`ChangeRequests` (
		`change_request_id` BIGINT NOT NULL,
		`request_id` BIGINT NOT NULL COMMENT '원본 요청 ID',
		`change_type` ENUM(
			'VOLUME_SIZE',
			'EXPIRES_AT',
			'RSGROUP_ID',
			'IMAGE_ID',
			'GROUPS'
		) NOT NULL,
		`old_value` JSON NULL COMMENT '기존 값 (비교용)',
		`new_value` JSON NOT NULL COMMENT '새로운 값',
		`reason` VARCHAR(1000) NOT NULL COMMENT '변경 사유',
		`status` ENUM('PENDING', 'APPROVED', 'DENIED') NOT NULL DEFAULT 'PENDING',
		`admin_comment` VARCHAR(500) NULL COMMENT '관리자 승인/거절 사유',
		`requested_by` BIGINT NOT NULL COMMENT '변경 요청한 사용자 ID',
		`reviewed_by` BIGINT NULL COMMENT '검토한 관리자 ID',
		`created_at` TIMESTAMP NOT NULL,
		`reviewed_at` TIMESTAMP NULL COMMENT '검토 완료 시간'
	);

CREATE TABLE
	`Nodes` (
		`node_id` VARCHAR(100) NOT NULL COMMENT 'ex. LAB1, FARM2',
		`rsgroup_id` INT NOT NULL,
		`memory_size_GB` INT NOT NULL,
		`CPU_core_count` INT NOT NULL
	);

ALTER TABLE `Requests`
ADD CONSTRAINT `PK_REQUESTS` PRIMARY KEY (`request_id`);

ALTER TABLE `ContainerImages`
ADD CONSTRAINT `PK_CONTAINERIMAGES` PRIMARY KEY (`image_id`);

ALTER TABLE `Groups`
ADD CONSTRAINT `PK_GROUPS` PRIMARY KEY (`ubuntu_gid`);

ALTER TABLE `ResourceGroups`
ADD CONSTRAINT `PK_RESOURCEGROUPS` PRIMARY KEY (`rsgroup_id`);

ALTER TABLE `UsedIds`
ADD CONSTRAINT `PK_USEDIDS` PRIMARY KEY (`id_value`);

ALTER TABLE `Users`
ADD CONSTRAINT `PK_USERS` PRIMARY KEY (`user_id`);

ALTER TABLE `GPUs`
ADD CONSTRAINT `PK_GPUS` PRIMARY KEY (`gpu_id`);

ALTER TABLE `RequestGroups`
ADD CONSTRAINT `PK_REQUESTGROUPS` PRIMARY KEY (`request_id`, `ubuntu_gid`);

ALTER TABLE `ChangeRequests`
ADD CONSTRAINT `PK_CHANGEREQUESTS` PRIMARY KEY (`change_request_id`);

ALTER TABLE `Nodes`
ADD CONSTRAINT `PK_NODES` PRIMARY KEY (`node_id`);

ALTER TABLE `Requests`
ADD CONSTRAINT `FK_Users_TO_Requests_1` FOREIGN KEY (`user_id`) REFERENCES `Users` (`user_id`);

ALTER TABLE `Requests`
ADD CONSTRAINT `FK_ResourceGroups_TO_Requests_1` FOREIGN KEY (`rsgroup_id`) REFERENCES `ResourceGroups` (`rsgroup_id`);

ALTER TABLE `Requests`
ADD CONSTRAINT `FK_ContainerImages_TO_Requests_1` FOREIGN KEY (`image_id`) REFERENCES `ContainerImages` (`image_id`);

ALTER TABLE `Requests`
ADD CONSTRAINT `FK_UsedIds_TO_Requests_1` FOREIGN KEY (`ubuntu_uid`) REFERENCES `UsedIds` (`id_value`);

ALTER TABLE `Groups`
ADD CONSTRAINT `FK_UsedIds_TO_Groups_1` FOREIGN KEY (`ubuntu_gid`) REFERENCES `UsedIds` (`id_value`);

ALTER TABLE `GPUs`
ADD CONSTRAINT `FK_Nodes_TO_GPUs_1` FOREIGN KEY (`node_id`) REFERENCES `Nodes` (`node_id`);

ALTER TABLE `RequestGroups`
ADD CONSTRAINT `FK_Requests_TO_RequestGroups_1` FOREIGN KEY (`request_id`) REFERENCES `Requests` (`request_id`);

ALTER TABLE `RequestGroups`
ADD CONSTRAINT `FK_Groups_TO_RequestGroups_1` FOREIGN KEY (`ubuntu_gid`) REFERENCES `Groups` (`ubuntu_gid`);

ALTER TABLE `ChangeRequests`
ADD CONSTRAINT `FK_Requests_TO_ChangeRequests_1` FOREIGN KEY (`request_id`) REFERENCES `Requests` (`request_id`);

ALTER TABLE `ChangeRequests`
ADD CONSTRAINT `FK_Users_TO_ChangeRequests_1` FOREIGN KEY (`requested_by`) REFERENCES `Users` (`user_id`);

ALTER TABLE `ChangeRequests`
ADD CONSTRAINT `FK_Users_TO_ChangeRequests_2` FOREIGN KEY (`reviewed_by`) REFERENCES `Users` (`user_id`);

ALTER TABLE `Nodes`
ADD CONSTRAINT `FK_ResourceGroups_TO_Nodes_1` FOREIGN KEY (`rsgroup_id`) REFERENCES `ResourceGroups` (`rsgroup_id`);