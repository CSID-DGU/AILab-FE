// 서버 신청 폼 검증
export const validateServerForm = (formData) => {
  const errors = {};

  if (!formData.ubuntu_username.trim()) {
    errors.ubuntu_username = "우분투 계정명을 입력해주세요.";
  } else if (!/^[a-z][a-z0-9_-]*[a-z0-9]$/.test(formData.ubuntu_username)) {
    errors.ubuntu_username =
      "유효한 우분투 계정명을 입력해주세요. (소문자, 숫자, _, - 만 사용 가능)";
  }

  if (!formData.ubuntu_password.trim()) {
    errors.ubuntu_password = "우분투 계정 비밀번호를 입력해주세요.";
  } else if (formData.ubuntu_password.length < 4) {
    errors.ubuntu_password = "비밀번호는 최소 4자 이상이어야 합니다.";
  }

  if (!formData.rsgroup_id) {
    errors.rsgroup_id = "GPU 기종을 선택해주세요.";
  }

  if (!formData.image_id) {
    errors.image_id = "컨테이너 이미지를 선택해주세요.";
  }

  if (!formData.expires_at) {
    errors.expires_at = "사용 만료일을 선택해주세요.";
  } else {
    const expiryDate = new Date(formData.expires_at);
    const today = new Date();
    if (expiryDate <= today) {
      errors.expires_at = "만료일은 오늘 이후 날짜여야 합니다.";
    }
  }

  if (!formData.volume_size_gb) {
    errors.volume_size_gb = "볼륨 크기를 입력해주세요.";
  } else {
    const size = parseInt(formData.volume_size_gb);
    if (isNaN(size) || size < 10 || size > 2000) {
      errors.volume_size_gb = "볼륨 크기는 10GB ~ 2000GB 사이여야 합니다.";
    }
  }

  if (!formData.usage_purpose.trim()) {
    errors.usage_purpose = "사용 목적을 입력해주세요.";
  } else if (formData.usage_purpose.length < 10) {
    errors.usage_purpose = "사용 목적을 10자 이상 입력해주세요.";
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors,
  };
};

// 서버 변경 요청 폼 검증
export const validateChangeRequestForm = (changeFormData) => {
  const errors = {};

  if (!changeFormData.request_id) {
    errors.request_id = "변경할 서버를 선택해주세요.";
  }

  if (!changeFormData.change_type) {
    errors.change_type = "변경 항목을 선택해주세요.";
  }

  if (!changeFormData.new_value) {
    errors.new_value = "새로운 값을 입력해주세요.";
  } else {
    // 변경 타입별 유효성 검사
    if (changeFormData.change_type === "VOLUME_SIZE") {
      const size = parseInt(changeFormData.new_value);
      if (isNaN(size) || size < 10 || size > 2000) {
        errors.new_value = "볼륨 크기는 10GB ~ 2000GB 사이여야 합니다.";
      }
    } else if (changeFormData.change_type === "EXPIRES_AT") {
      const expiryDate = new Date(changeFormData.new_value);
      const today = new Date();
      if (expiryDate <= today) {
        errors.new_value = "만료일은 오늘 이후 날짜여야 합니다.";
      }
    }
  }

  if (!changeFormData.reason.trim()) {
    errors.reason = "변경 사유를 입력해주세요.";
  } else if (changeFormData.reason.length < 10) {
    errors.reason = "변경 사유를 10자 이상 입력해주세요.";
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors,
  };
};