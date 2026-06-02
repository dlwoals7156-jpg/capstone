CREATE DATABASE IF NOT EXISTS deeplook_capstone
  DEFAULT CHARACTER SET utf8mb4
  DEFAULT COLLATE utf8mb4_unicode_ci;

USE deeplook_capstone;

DROP TABLE IF EXISTS fashion_products;
DROP TABLE IF EXISTS beauty_products;

CREATE TABLE fashion_products (
  product_id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  product_name VARCHAR(120) NOT NULL,
  brand_name VARCHAR(80) NOT NULL,
  gender_target SET('male', 'female', 'unisex') NOT NULL,
  category ENUM('top', 'bottom', 'outer', 'dress', 'shoes', 'bag', 'accessory') NOT NULL,
  sub_category VARCHAR(80) NOT NULL,
  fit_type ENUM('slim', 'regular', 'loose', 'oversized', 'wide', 'flare', 'a_line', 'straight', 'cropped', 'structured') NOT NULL,
  color_name VARCHAR(60) NOT NULL,
  color_group ENUM('black', 'white', 'ivory', 'beige', 'brown', 'gray', 'navy', 'blue', 'green', 'pink', 'red', 'coral', 'orange', 'purple', 'yellow', 'khaki', 'burgundy', 'silver', 'gold') NOT NULL,
  personal_color_type SET(
    'spring_light', 'spring_bright', 'spring_true',
    'summer_light', 'summer_bright', 'summer_mute',
    'autumn_mute', 'autumn_true', 'autumn_deep',
    'winter_bright', 'winter_true', 'winter_deep'
  ) NOT NULL,
  body_type SET('straight', 'wave', 'natural', 'inverted_triangle', 'pear', 'hourglass', 'rectangle', 'oval') NOT NULL,
  style_tag SET('minimal', 'chic', 'casual', 'feminine', 'sporty', 'modern', 'street', 'elegant', 'lovely', 'natural', 'dandy', 'luxury', 'classic') NOT NULL,
  season SET('spring', 'summer', 'fall', 'winter', 'all') NOT NULL,
  situation SET('daily', 'campus', 'date', 'interview', 'wedding_guest', 'travel', 'party', 'workout', 'office') NOT NULL,
  price INT UNSIGNED NOT NULL,
  image_url VARCHAR(255) NOT NULL,
  recommendation_reason VARCHAR(500) NOT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (product_id),
  INDEX idx_fashion_category (category, sub_category),
  INDEX idx_fashion_gender (gender_target),
  INDEX idx_fashion_color (personal_color_type),
  INDEX idx_fashion_body (body_type),
  INDEX idx_fashion_style (style_tag),
  INDEX idx_fashion_season (season),
  INDEX idx_fashion_situation (situation)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE beauty_products (
  product_id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  product_name VARCHAR(120) NOT NULL,
  brand_name VARCHAR(80) NOT NULL,
  gender_target SET('male', 'female', 'unisex') NOT NULL,
  category ENUM('base', 'lip', 'eye', 'cheek', 'skin_care', 'tool') NOT NULL,
  sub_category VARCHAR(80) NOT NULL,
  shade_name VARCHAR(80) NOT NULL,
  color_group ENUM('black', 'white', 'ivory', 'beige', 'brown', 'gray', 'navy', 'blue', 'green', 'pink', 'red', 'coral', 'orange', 'purple', 'yellow', 'khaki', 'burgundy', 'silver', 'gold', 'clear') NOT NULL,
  skin_tone ENUM('warm', 'cool', 'neutral', 'olive', 'all') NOT NULL,
  personal_color_type SET(
    'spring_light', 'spring_bright', 'spring_true',
    'summer_light', 'summer_bright', 'summer_mute',
    'autumn_mute', 'autumn_true', 'autumn_deep',
    'winter_bright', 'winter_true', 'winter_deep'
  ) NOT NULL,
  finish_type ENUM('matte', 'glow', 'satin', 'sheer', 'velvet', 'dewy', 'natural') NOT NULL,
  style_tag SET('minimal', 'chic', 'casual', 'feminine', 'sporty', 'modern', 'street', 'elegant', 'lovely', 'natural', 'dandy', 'luxury', 'classic') NOT NULL,
  season SET('spring', 'summer', 'fall', 'winter', 'all') NOT NULL,
  situation SET('daily', 'campus', 'date', 'interview', 'wedding_guest', 'travel', 'party', 'workout', 'office') NOT NULL,
  price INT UNSIGNED NOT NULL,
  image_url VARCHAR(255) NOT NULL,
  recommendation_reason VARCHAR(500) NOT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (product_id),
  INDEX idx_beauty_category (category, sub_category),
  INDEX idx_beauty_gender (gender_target),
  INDEX idx_beauty_skin (skin_tone),
  INDEX idx_beauty_color (personal_color_type),
  INDEX idx_beauty_style (style_tag),
  INDEX idx_beauty_season (season),
  INDEX idx_beauty_situation (situation)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

INSERT INTO fashion_products (
  product_name, brand_name, gender_target, category, sub_category, fit_type,
  color_name, color_group, personal_color_type, body_type, style_tag,
  season, situation, price, image_url, recommendation_reason
) VALUES
('블랙 슬림핏 슬랙스', 'Nero Studio', 'unisex', 'bottom', 'slacks', 'slim', '블랙', 'black', 'winter_deep,winter_bright,winter_true', 'straight,rectangle', 'minimal,chic,modern', 'all', 'date,office,interview', 59000, '/images/fashion/f001.jpg', '겨울 딥의 선명한 대비감과 잘 맞고 스트레이트 골격의 직선적인 실루엣을 살립니다.'),
('딥 네이비 테일러드 자켓', 'Line Archive', 'unisex', 'outer', 'tailored_jacket', 'structured', '딥 네이비', 'navy', 'winter_deep,winter_true', 'straight,inverted_triangle', 'chic,modern,minimal', 'fall,winter', 'office,date,interview', 129000, '/images/fashion/f002.jpg', '차가운 네이비가 겨울 타입의 대비감을 살리고 어깨선을 정돈해 격식 있는 상황에 좋습니다.'),
('아이보리 린넨 셔츠', 'Serein Wear', 'unisex', 'top', 'linen_shirt', 'regular', '아이보리', 'ivory', 'spring_light,summer_light', 'wave,hourglass', 'minimal,casual,natural', 'spring,summer', 'daily,campus,travel', 43000, '/images/fashion/f003.jpg', '밝은 아이보리가 라이트 톤을 부드럽게 밝혀 주고 가벼운 소재가 웨이브 체형에 자연스럽습니다.'),
('피치 코튼 가디건', 'Lumiere Lane', 'female', 'outer', 'cardigan', 'cropped', '피치', 'coral', 'spring_light,spring_bright', 'wave,pear', 'lovely,feminine,casual', 'spring', 'date,campus,daily', 52000, '/images/fashion/f004.jpg', '피치 컬러가 봄 타입의 생기를 살리고 짧은 기장이 하체 비율을 보완합니다.'),
('세이지 플리츠 스커트', 'Dew Closet', 'female', 'bottom', 'pleated_skirt', 'a_line', '세이지', 'green', 'summer_mute,summer_light', 'wave,pear,hourglass', 'feminine,elegant,natural', 'spring,summer', 'date,wedding_guest,campus', 62000, '/images/fashion/f005.jpg', '차분한 세이지 톤이 여름 뮤트에 어울리고 플리츠 라인이 골반과 허리선을 부드럽게 보완합니다.'),
('카멜 와이드 팬츠', 'Mellow Form', 'unisex', 'bottom', 'wide_pants', 'wide', '카멜', 'brown', 'autumn_true,autumn_mute', 'natural,pear,rectangle', 'casual,natural,modern', 'fall', 'daily,travel,campus', 69000, '/images/fashion/f006.jpg', '따뜻한 카멜이 가을 톤과 잘 맞고 와이드 핏이 내추럴 골격의 여유 있는 무드를 살립니다.'),
('올리브 유틸리티 자켓', 'Urban Veil', 'unisex', 'outer', 'utility_jacket', 'loose', '올리브', 'khaki', 'autumn_mute,autumn_true', 'natural,inverted_triangle', 'street,casual,natural', 'fall', 'travel,daily,campus', 98000, '/images/fashion/f007.jpg', '올리브 컬러와 실용적인 포켓 디테일이 가을 뮤트와 내추럴 골격에 안정적으로 어울립니다.'),
('로즈 베이지 랩 원피스', 'Aube Label', 'female', 'dress', 'wrap_dress', 'a_line', '로즈 베이지', 'pink', 'summer_light,summer_mute', 'wave,hourglass', 'feminine,elegant,lovely', 'spring,summer', 'date,wedding_guest', 89000, '/images/fashion/f008.jpg', '부드러운 로즈 베이지가 쿨 라이트 피부를 맑게 보이고 랩 디자인이 허리 라인을 강조합니다.'),
('크림 스트레이트 데님', 'Soft Frame', 'unisex', 'bottom', 'denim', 'straight', '크림', 'ivory', 'spring_light,summer_light', 'straight,rectangle', 'casual,minimal,modern', 'spring,summer', 'daily,campus,travel', 54000, '/images/fashion/f009.jpg', '밝은 크림 컬러가 라이트 톤에 잘 맞고 일자핏이 체형을 깔끔하게 정돈합니다.'),
('차콜 니트 베스트', 'Noir Habit', 'unisex', 'top', 'knit_vest', 'regular', '차콜', 'gray', 'winter_deep,winter_true,summer_mute', 'straight,natural', 'chic,minimal,dandy', 'fall,winter', 'office,campus,date', 49000, '/images/fashion/f010.jpg', '차콜 컬러가 쿨하고 깊은 톤에 어울리며 레이어드 시 상체 라인을 단정하게 보입니다.'),
('라이트 블루 옥스포드 셔츠', 'Mode Atelier', 'unisex', 'top', 'oxford_shirt', 'regular', '라이트 블루', 'blue', 'summer_light,summer_bright,spring_light', 'straight,wave', 'minimal,classic,casual', 'spring,summer', 'office,campus,daily', 46000, '/images/fashion/f011.jpg', '맑은 블루가 여름 라이트의 청량감을 살리고 셔츠 구조가 데일리 추천에 안정적입니다.'),
('브릭 레더 벨트', 'Line Archive', 'unisex', 'accessory', 'belt', 'structured', '브릭 브라운', 'brown', 'autumn_deep,autumn_true', 'straight,natural', 'classic,chic,dandy', 'fall,winter', 'office,date,daily', 35000, '/images/fashion/f012.jpg', '브릭 브라운이 가을 딥의 깊이감과 맞고 허리선을 잡아 비율 보완에 도움이 됩니다.'),
('퓨어 화이트 크롭 자켓', 'Vivid Yard', 'female', 'outer', 'cropped_jacket', 'cropped', '퓨어 화이트', 'white', 'winter_bright,winter_true', 'straight,wave,hourglass', 'chic,modern,feminine', 'spring,fall', 'date,party,wedding_guest', 118000, '/images/fashion/f013.jpg', '순백 컬러가 겨울 브라이트의 선명함을 살리고 크롭 기장이 허리 위치를 높여 보입니다.'),
('모카 리브 니트', 'Mellow Form', 'unisex', 'top', 'rib_knit', 'slim', '모카', 'brown', 'autumn_mute,autumn_true', 'straight,wave', 'natural,casual,minimal', 'fall,winter', 'daily,campus,office', 47000, '/images/fashion/f014.jpg', '부드러운 모카 색이 가을 뮤트 피부와 자연스럽고 리브 조직이 상체 실루엣을 정리합니다.'),
('라벤더 시어 블라우스', 'Dew Closet', 'female', 'top', 'blouse', 'regular', '라벤더', 'purple', 'summer_light,summer_mute', 'wave,hourglass', 'feminine,lovely,elegant', 'spring,summer', 'date,wedding_guest,campus', 58000, '/images/fashion/f015.jpg', '라벤더 컬러가 여름 타입의 쿨한 투명감을 살리고 부드러운 소재가 웨이브 골격에 좋습니다.'),
('로열 블루 미니 원피스', 'Nero Studio', 'female', 'dress', 'mini_dress', 'structured', '로열 블루', 'blue', 'winter_bright,winter_true', 'straight,hourglass', 'chic,elegant,modern', 'all', 'date,party', 94000, '/images/fashion/f016.jpg', '선명한 로열 블루가 겨울 브라이트의 대비감을 강화하고 구조적인 핏이 라인을 잡아 줍니다.'),
('블랙 앵클 부츠', 'Noir Habit', 'unisex', 'shoes', 'ankle_boots', 'structured', '블랙', 'black', 'winter_deep,winter_true,autumn_deep', 'straight,natural,rectangle', 'chic,modern,street', 'fall,winter', 'date,party,daily', 109000, '/images/fashion/f017.jpg', '딥 톤 컬러 팔레트와 쉽게 매칭되고 직선적인 라스트가 스타일을 세련되게 마무리합니다.'),
('샌드 베이지 로퍼', 'Mode Atelier', 'unisex', 'shoes', 'loafer', 'structured', '샌드 베이지', 'beige', 'spring_light,autumn_mute', 'straight,wave,natural', 'minimal,classic,dandy', 'spring,fall', 'office,campus,daily', 85000, '/images/fashion/f018.jpg', '차분한 베이지가 웜 라이트와 뮤트 톤에 자연스럽고 단정한 착장에 활용도가 높습니다.'),
('쿨 그레이 토트백', 'Line Archive', 'unisex', 'bag', 'tote_bag', 'structured', '쿨 그레이', 'gray', 'summer_mute,winter_true,winter_deep', 'straight,natural,rectangle', 'minimal,modern,chic', 'all', 'office,campus,interview', 76000, '/images/fashion/f019.jpg', '쿨 그레이가 여름 뮤트와 겨울 톤 모두에 어울리고 면접과 직장 룩에 단정합니다.'),
('코랄 니트 탑', 'Lumiere Lane', 'female', 'top', 'knit_top', 'regular', '코랄', 'coral', 'spring_bright,spring_light,spring_true', 'wave,hourglass,pear', 'lovely,feminine,casual', 'spring,summer', 'date,daily,campus', 44000, '/images/fashion/f020.jpg', '코랄 컬러가 봄 타입의 생기를 살리고 부드러운 니트가 러블리한 분위기를 만듭니다.'),
('테라코타 미디 스커트', 'Aube Label', 'female', 'bottom', 'midi_skirt', 'a_line', '테라코타', 'orange', 'autumn_true,autumn_deep', 'pear,hourglass,wave', 'feminine,natural,elegant', 'fall', 'date,wedding_guest,daily', 67000, '/images/fashion/f021.jpg', '따뜻하고 깊은 테라코타가 가을 톤과 조화롭고 A라인이 하체 균형을 보완합니다.'),
('카키 카고 팬츠', 'Urban Veil', 'unisex', 'bottom', 'cargo_pants', 'loose', '카키', 'khaki', 'autumn_mute,autumn_true', 'natural,inverted_triangle,rectangle', 'street,casual,sporty', 'spring,fall', 'travel,daily,campus', 72000, '/images/fashion/f022.jpg', '카키와 여유 있는 카고핏이 내추럴 골격과 스트릿 스타일 선호에 잘 맞습니다.'),
('버건디 새틴 블라우스', 'Noir Habit', 'female', 'top', 'satin_blouse', 'regular', '버건디', 'burgundy', 'winter_deep,autumn_deep', 'straight,hourglass,wave', 'chic,elegant,luxury', 'fall,winter', 'date,party,wedding_guest', 79000, '/images/fashion/f023.jpg', '깊은 버건디가 딥 타입의 분위기를 살리고 새틴 광택이 데이트와 파티 룩에 어울립니다.'),
('민트 소프트 카디건', 'Serein Wear', 'female', 'outer', 'cardigan', 'regular', '민트', 'green', 'spring_light,summer_light', 'wave,pear', 'lovely,casual,natural', 'spring', 'campus,daily,date', 51000, '/images/fashion/f024.jpg', '맑은 민트가 라이트 톤을 부드럽게 밝히고 과하지 않은 실루엣으로 데일리에 좋습니다.'),
('실버 후프 이어링', 'Vivid Yard', 'female', 'accessory', 'earring', 'structured', '실버', 'silver', 'summer_light,summer_bright,winter_bright,winter_deep', 'straight,wave,hourglass', 'chic,modern,elegant', 'all', 'date,party,wedding_guest', 29000, '/images/fashion/f025.jpg', '차가운 실버 광택이 쿨 톤의 맑은 인상을 살리고 얼굴 주변에 세련된 포인트를 줍니다.'),
('딥 인디고 스트레이트 데님', 'Soft Frame', 'unisex', 'bottom', 'denim', 'straight', '딥 인디고', 'navy', 'winter_deep,winter_true,summer_mute', 'straight,rectangle,natural', 'casual,modern,minimal', 'all', 'daily,campus,travel', 64000, '/images/fashion/f026.jpg', '딥 인디고가 쿨하고 깊은 톤에 안정적이며 스트레이트 핏이 체형을 깔끔하게 잡아 줍니다.'),
('버터 옐로우 카디건', 'Lumiere Lane', 'female', 'outer', 'cardigan', 'cropped', '버터 옐로우', 'yellow', 'spring_light,spring_true', 'wave,pear,hourglass', 'lovely,feminine,casual', 'spring', 'date,campus,daily', 53000, '/images/fashion/f027.jpg', '밝고 따뜻한 옐로우가 봄 라이트의 생기를 강조하고 크롭 기장이 비율을 보완합니다.'),
('차콜 롱 코트', 'Noir Habit', 'unisex', 'outer', 'long_coat', 'straight', '차콜', 'gray', 'winter_deep,winter_true,summer_mute', 'straight,natural,rectangle', 'minimal,chic,modern', 'winter', 'office,date,interview', 179000, '/images/fashion/f028.jpg', '차콜 컬러와 긴 직선 실루엣이 겨울 딥과 스트레이트 골격에 강한 장점을 줍니다.'),
('토프 트렌치 코트', 'Mode Atelier', 'unisex', 'outer', 'trench_coat', 'regular', '토프', 'beige', 'summer_mute,autumn_mute', 'straight,natural,wave', 'classic,modern,elegant', 'spring,fall', 'office,travel,date', 148000, '/images/fashion/f029.jpg', '토프 컬러가 뮤트 타입에 차분하게 어울리고 트렌치 구조가 격식과 데일리를 모두 커버합니다.'),
('블랙 미니 숄더백', 'Nero Studio', 'female', 'bag', 'shoulder_bag', 'structured', '블랙', 'black', 'winter_deep,winter_bright,winter_true', 'straight,wave,hourglass', 'chic,minimal,luxury', 'all', 'date,party,office', 88000, '/images/fashion/f030.jpg', '블랙 포인트가 겨울 타입의 선명한 이미지를 살리고 미니 사이즈가 데이트 룩에 잘 맞습니다.'),
('네이비 H라인 스커트', 'Line Archive', 'female', 'bottom', 'h_line_skirt', 'slim', '네이비', 'navy', 'summer_mute,winter_deep,winter_true', 'straight,hourglass,rectangle', 'minimal,chic,elegant', 'all', 'office,interview,date', 61000, '/images/fashion/f031.jpg', '네이비 H라인은 쿨 톤에 안정적이고 직선 체형의 단정한 인상을 강화합니다.'),
('더스티 핑크 티셔츠', 'Dew Closet', 'unisex', 'top', 't_shirt', 'regular', '더스티 핑크', 'pink', 'summer_mute,summer_light', 'wave,pear,rectangle', 'casual,lovely,natural', 'spring,summer', 'daily,campus,travel', 29000, '/images/fashion/f032.jpg', '더스티 핑크가 여름 뮤트의 부드러운 피부톤과 잘 맞고 편안한 데일리 룩에 적합합니다.'),
('아이보리 와이드 슬랙스', 'Serein Wear', 'unisex', 'bottom', 'wide_slacks', 'wide', '아이보리', 'ivory', 'spring_light,summer_light', 'natural,pear,rectangle', 'minimal,modern,elegant', 'spring,summer', 'office,date,daily', 71000, '/images/fashion/f033.jpg', '밝은 아이보리가 라이트 톤에 어울리고 와이드 실루엣이 하체 라인을 자연스럽게 보완합니다.'),
('초콜릿 셔츠 자켓', 'Mellow Form', 'unisex', 'outer', 'shirt_jacket', 'loose', '초콜릿 브라운', 'brown', 'autumn_deep,autumn_true', 'natural,straight,oval', 'natural,casual,modern', 'fall,winter', 'daily,travel,campus', 96000, '/images/fashion/f034.jpg', '초콜릿 브라운이 가을 딥의 깊이감과 어울리고 셔츠 자켓이 편안한 체형 보완을 돕습니다.'),
('크림 니트 원피스', 'Aube Label', 'female', 'dress', 'knit_dress', 'regular', '크림', 'ivory', 'spring_light,summer_light', 'wave,hourglass,pear', 'feminine,lovely,natural', 'fall,winter', 'date,daily,wedding_guest', 87000, '/images/fashion/f035.jpg', '크림 컬러와 부드러운 니트 질감이 라이트 타입과 웨이브 골격에 자연스럽게 어울립니다.'),
('코발트 크롭 셔츠', 'Vivid Yard', 'unisex', 'top', 'cropped_shirt', 'cropped', '코발트', 'blue', 'winter_bright,winter_true,summer_bright', 'straight,wave,rectangle', 'street,chic,modern', 'spring,summer', 'date,campus,party', 56000, '/images/fashion/f036.jpg', '선명한 코발트가 브라이트 타입의 장점을 살리고 크롭 기장이 상하체 비율을 개선합니다.'),
('페일 핑크 발레 플랫', 'Dew Closet', 'female', 'shoes', 'flat_shoes', 'regular', '페일 핑크', 'pink', 'spring_light,summer_light', 'wave,pear,hourglass', 'lovely,feminine,elegant', 'spring,summer', 'date,wedding_guest,daily', 69000, '/images/fashion/f037.jpg', '은은한 핑크가 라이트 톤에 부드럽고 낮은 굽이 러블리한 착장에 잘 어울립니다.'),
('딥 그린 스웨터', 'Mellow Form', 'unisex', 'top', 'sweater', 'regular', '딥 그린', 'green', 'autumn_deep,winter_deep', 'straight,natural,oval', 'natural,chic,casual', 'fall,winter', 'daily,date,travel', 64000, '/images/fashion/f038.jpg', '깊은 그린이 딥 타입의 무게감을 살리고 니트 소재가 겨울 데일리 룩에 안정적입니다.'),
('오트밀 후디', 'Urban Veil', 'unisex', 'top', 'hoodie', 'oversized', '오트밀', 'beige', 'spring_light,autumn_mute', 'natural,rectangle,oval', 'casual,street,sporty', 'fall,winter', 'daily,campus,travel', 61000, '/images/fashion/f039.jpg', '오트밀 컬러가 웜 라이트와 뮤트 톤에 편안하게 어울리고 오버핏이 캐주얼 무드에 좋습니다.'),
('그래파이트 조거 팬츠', 'Urban Veil', 'unisex', 'bottom', 'jogger_pants', 'loose', '그래파이트', 'gray', 'winter_deep,summer_mute,winter_true', 'natural,rectangle,oval', 'sporty,street,casual', 'all', 'workout,travel,daily', 57000, '/images/fashion/f040.jpg', '차분한 그래파이트가 쿨 톤에 잘 맞고 활동성이 필요한 상황에서 편안합니다.'),
('웜 베이지 블레이저', 'Mode Atelier', 'unisex', 'outer', 'blazer', 'structured', '웜 베이지', 'beige', 'spring_true,autumn_mute,autumn_true', 'straight,inverted_triangle,rectangle', 'classic,dandy,modern', 'spring,fall', 'office,interview,date', 124000, '/images/fashion/f041.jpg', '따뜻한 베이지가 웜 톤에 안정적이고 구조적인 블레이저가 면접과 직장 룩에 적합합니다.'),
('플럼 타이 블라우스', 'Noir Habit', 'female', 'top', 'tie_blouse', 'regular', '플럼', 'purple', 'winter_deep,winter_true,summer_mute', 'wave,straight,hourglass', 'chic,elegant,feminine', 'fall,winter', 'date,office,party', 73000, '/images/fashion/f042.jpg', '플럼 컬러가 딥 쿨 톤과 조화롭고 타이 디테일이 상체 포인트를 만들어 줍니다.'),
('화이트 미니멀 스니커즈', 'Soft Frame', 'unisex', 'shoes', 'sneakers', 'regular', '화이트', 'white', 'spring_light,summer_light,winter_bright,winter_true', 'straight,wave,natural,rectangle,pear', 'minimal,casual,sporty', 'all', 'daily,campus,travel,workout', 79000, '/images/fashion/f043.jpg', '깨끗한 화이트가 다양한 톤과 매칭되고 캐주얼 추천의 활용도가 높습니다.'),
('에스프레소 스트레이트 코트', 'Line Archive', 'unisex', 'outer', 'straight_coat', 'straight', '에스프레소', 'brown', 'autumn_deep,autumn_true', 'straight,natural,rectangle', 'classic,chic,dandy', 'winter', 'office,date,interview', 189000, '/images/fashion/f044.jpg', '에스프레소 브라운이 가을 딥의 깊이를 살리고 일자 실루엣이 체형을 길어 보이게 합니다.'),
('스카이 블루 스트라이프 셔츠', 'Serein Wear', 'unisex', 'top', 'stripe_shirt', 'regular', '스카이 블루', 'blue', 'summer_light,spring_light,summer_bright', 'straight,wave,natural', 'casual,minimal,classic', 'spring,summer', 'campus,office,daily', 48000, '/images/fashion/f045.jpg', '맑은 블루 스트라이프가 라이트 타입에 청량하고 캠퍼스와 오피스 모두에 적합합니다.'),
('블랙 구조적 원피스', 'Nero Studio', 'female', 'dress', 'structured_dress', 'structured', '블랙', 'black', 'winter_deep,winter_bright,winter_true', 'straight,hourglass,inverted_triangle', 'chic,minimal,elegant', 'all', 'date,party,interview', 112000, '/images/fashion/f046.jpg', '블랙과 구조적인 패턴이 겨울 톤과 스트레이트 골격에 잘 맞아 세련된 인상을 줍니다.'),
('샌드 카고 스커트', 'Urban Veil', 'female', 'bottom', 'cargo_skirt', 'a_line', '샌드', 'beige', 'spring_light,autumn_mute', 'natural,pear,rectangle', 'casual,street,natural', 'spring,summer,fall', 'daily,campus,travel', 58000, '/images/fashion/f047.jpg', '샌드 베이지가 웜 라이트와 뮤트 톤에 잘 맞고 카고 디테일이 캐주얼 무드를 살립니다.'),
('올리브 니트 폴로', 'Mellow Form', 'unisex', 'top', 'knit_polo', 'regular', '올리브', 'khaki', 'autumn_mute,autumn_true', 'straight,natural,rectangle', 'natural,classic,dandy', 'spring,fall', 'office,campus,daily', 56000, '/images/fashion/f048.jpg', '올리브 톤이 가을 계열의 피부 온도감과 잘 맞고 폴로 카라가 단정함을 줍니다.'),
('아이스 그레이 카디건', 'Serein Wear', 'unisex', 'outer', 'cardigan', 'regular', '아이스 그레이', 'gray', 'summer_light,summer_bright,winter_bright', 'wave,straight,rectangle', 'minimal,modern,casual', 'spring,summer', 'office,campus,daily', 54000, '/images/fashion/f049.jpg', '차가운 라이트 그레이가 쿨 톤의 맑은 이미지를 살리고 가벼운 레이어링에 좋습니다.'),
('비비드 레드 스카프', 'Vivid Yard', 'female', 'accessory', 'scarf', 'regular', '비비드 레드', 'red', 'winter_bright,winter_true,spring_bright', 'straight,wave,hourglass', 'chic,elegant,lovely', 'fall,winter', 'date,party,wedding_guest', 33000, '/images/fashion/f050.jpg', '선명한 레드가 브라이트 타입의 얼굴 생기를 높이고 단순한 룩에 포인트를 줍니다.');

INSERT INTO beauty_products (
  product_name, brand_name, gender_target, category, sub_category,
  shade_name, color_group, skin_tone, personal_color_type, finish_type,
  style_tag, season, situation, price, image_url, recommendation_reason
) VALUES
('딥 베리 벨벳 립스틱', 'Tone Lab', 'female', 'lip', 'lipstick', '딥 베리', 'burgundy', 'cool', 'winter_deep,winter_true', 'velvet', 'chic,elegant,modern', 'fall,winter', 'date,party', 26000, '/images/beauty/b001.jpg', '겨울 딥의 깊은 대비감을 살리는 베리 컬러로 시크한 메이크업에 적합합니다.'),
('클리어 레드 워터 틴트', 'Prism Skin', 'female', 'lip', 'tint', '클리어 레드', 'red', 'cool', 'winter_bright,winter_true,spring_bright', 'sheer', 'chic,lovely,modern', 'all', 'date,party,daily', 18000, '/images/beauty/b002.jpg', '맑고 선명한 레드가 브라이트 타입의 생기를 높이고 가볍게 레이어링됩니다.'),
('피치 코랄 글로우 틴트', 'Peach Archive', 'female', 'lip', 'tint', '피치 코랄', 'coral', 'warm', 'spring_light,spring_bright,spring_true', 'glow', 'lovely,feminine,casual', 'spring,summer', 'date,campus,daily', 17000, '/images/beauty/b003.jpg', '따뜻한 코랄이 봄 타입의 혈색을 자연스럽게 살려 데일리 메이크업에 좋습니다.'),
('애프리콧 소프트 블러셔', 'Bloom Lab', 'female', 'cheek', 'powder_blush', '애프리콧', 'orange', 'warm', 'spring_light,spring_true,autumn_true', 'satin', 'lovely,natural,feminine', 'spring', 'daily,date,campus', 22000, '/images/beauty/b004.jpg', '살구빛 컬러가 웜 톤 피부에 부드러운 생기를 주고 과하지 않은 채도를 제공합니다.'),
('로즈 모브 블러셔', 'Mauve Room', 'female', 'cheek', 'powder_blush', '로즈 모브', 'pink', 'cool', 'summer_mute,summer_light', 'matte', 'feminine,elegant,natural', 'all', 'date,wedding_guest,office', 23000, '/images/beauty/b005.jpg', '차분한 모브 로즈가 여름 뮤트의 낮은 채도와 조화롭고 얼굴을 차분하게 정리합니다.'),
('라벤더 톤업 베이스', 'Clear Muse', 'unisex', 'base', 'tone_up_base', '라벤더 베일', 'purple', 'cool', 'summer_light,summer_bright,winter_bright', 'glow', 'minimal,natural,modern', 'spring,summer', 'daily,campus,office', 31000, '/images/beauty/b006.jpg', '노란기를 보정해 쿨 톤 피부를 맑게 보이게 하고 가벼운 광을 더합니다.'),
('아이보리 쉬어 쿠션', 'Prism Skin', 'unisex', 'base', 'cushion', '라이트 아이보리', 'ivory', 'neutral', 'spring_light,summer_light', 'dewy', 'natural,minimal,lovely', 'all', 'daily,campus,date', 34000, '/images/beauty/b007.jpg', '밝은 피부톤에 자연스럽게 밀착되고 라이트 타입의 투명한 인상을 살립니다.'),
('뉴트럴 베이지 파운데이션', 'Nude Theory', 'unisex', 'base', 'foundation', '뉴트럴 베이지', 'beige', 'neutral', 'spring_true,summer_mute,autumn_mute,winter_true', 'natural', 'minimal,modern,natural', 'all', 'daily,office,interview', 39000, '/images/beauty/b008.jpg', '중간 피부톤에 무난하게 맞고 과한 색 보정 없이 균형 잡힌 베이스를 만듭니다.'),
('매트 베이지 쿠션', 'Olive Veil', 'unisex', 'base', 'cushion', '뮤트 베이지', 'beige', 'olive', 'autumn_mute,autumn_true', 'matte', 'natural,minimal,casual', 'fall,summer', 'daily,office,travel', 33000, '/images/beauty/b009.jpg', '노란기와 올리브 기가 있는 피부에 안정적이고 매트 마감으로 그림자감을 줄입니다.'),
('테라코타 새틴 립', 'Velvet Dew', 'female', 'lip', 'lipstick', '테라코타', 'orange', 'warm', 'autumn_true,autumn_deep', 'satin', 'chic,natural,elegant', 'fall,winter', 'date,party,daily', 24000, '/images/beauty/b010.jpg', '깊은 오렌지 브라운이 가을 타입의 색온도와 잘 맞아 성숙한 분위기를 줍니다.'),
('브릭 브라운 립스틱', 'Olive Veil', 'female', 'lip', 'lipstick', '브릭 브라운', 'brown', 'warm', 'autumn_deep,autumn_true', 'velvet', 'chic,natural,luxury', 'fall,winter', 'date,party', 27000, '/images/beauty/b011.jpg', '가을 딥의 깊이와 채도를 살려 입체감 있는 립 포인트를 만들어 줍니다.'),
('소프트 핑크 아이섀도우', 'Mauve Room', 'female', 'eye', 'single_shadow', '소프트 핑크', 'pink', 'cool', 'summer_light,summer_mute', 'satin', 'lovely,feminine,natural', 'spring,summer', 'daily,date,campus', 15000, '/images/beauty/b012.jpg', '부드러운 핑크가 여름 라이트 피부에 탁하지 않게 올라가 자연스러운 눈매를 만듭니다.'),
('토프 그레이 섀도우', 'Nude Theory', 'unisex', 'eye', 'single_shadow', '토프 그레이', 'gray', 'cool', 'summer_mute,winter_true', 'matte', 'minimal,chic,modern', 'all', 'daily,office,interview', 16000, '/images/beauty/b013.jpg', '쿨한 토프 그레이가 여름 뮤트와 겨울 톤의 음영 메이크업에 안정적입니다.'),
('샴페인 빔 하이라이터', 'Lune Glow', 'female', 'cheek', 'highlighter', '샴페인', 'gold', 'warm', 'spring_light,spring_bright,spring_true', 'glow', 'lovely,elegant,luxury', 'all', 'date,party,wedding_guest', 28000, '/images/beauty/b014.jpg', '밝고 따뜻한 광이 봄 타입의 생기와 잘 맞고 얼굴 중앙을 환하게 밝혀 줍니다.'),
('클리어 글로스', 'Clear Muse', 'unisex', 'lip', 'lip_gloss', '클리어', 'clear', 'all', 'spring_light,spring_bright,summer_light,summer_bright,autumn_mute,autumn_true,autumn_deep,winter_bright,winter_true,winter_deep', 'glow', 'minimal,natural,casual', 'all', 'daily,campus,date,party', 14000, '/images/beauty/b015.jpg', '컬러 타입을 크게 타지 않고 기존 립 위에 광택을 더해 활용도가 높습니다.'),
('플럼 젤 아이라이너', 'Tone Lab', 'female', 'eye', 'eyeliner', '플럼 블랙', 'purple', 'cool', 'winter_deep,winter_true', 'matte', 'chic,modern,elegant', 'fall,winter', 'date,party', 19000, '/images/beauty/b016.jpg', '깊은 플럼 블랙이 겨울 딥의 눈매 대비를 살리고 블랙보다 부드러운 포인트를 줍니다.'),
('브라운 컬링 마스카라', 'Olive Veil', 'female', 'eye', 'mascara', '딥 브라운', 'brown', 'warm', 'spring_true,autumn_mute,autumn_true,autumn_deep', 'natural', 'natural,casual,feminine', 'all', 'daily,campus,date', 21000, '/images/beauty/b017.jpg', '딥 브라운이 웜 톤의 눈매를 부드럽게 강조하고 데일리에 부담이 적습니다.'),
('애쉬 브로우 펜슬', 'Mauve Room', 'unisex', 'eye', 'brow_pencil', '애쉬 브라운', 'brown', 'cool', 'summer_mute,winter_true,winter_deep', 'matte', 'minimal,natural,modern', 'all', 'daily,office,interview', 13000, '/images/beauty/b018.jpg', '붉은기를 줄인 애쉬 브라운이 쿨 톤 헤어와 눈썹에 자연스럽게 어울립니다.'),
('올리브 베이지 컨실러', 'Olive Veil', 'unisex', 'base', 'concealer', '올리브 베이지', 'beige', 'olive', 'autumn_mute,autumn_true', 'natural', 'minimal,natural,modern', 'all', 'daily,office,travel', 18000, '/images/beauty/b019.jpg', '올리브 기가 있는 피부의 붉은기를 안정적으로 커버하고 베이스 균형을 맞춥니다.'),
('쿨 베이지 쿠션', 'Prism Skin', 'unisex', 'base', 'cushion', '쿨 베이지', 'beige', 'cool', 'summer_light,summer_mute,winter_true', 'satin', 'minimal,modern,natural', 'all', 'daily,office,date', 35000, '/images/beauty/b020.jpg', '핑크 베이스가 필요한 쿨 톤 피부에 어울리고 세미 새틴 마감으로 단정합니다.'),
('로즈 세럼 블러셔', 'Lune Glow', 'female', 'cheek', 'liquid_blush', '로즈 세럼', 'pink', 'cool', 'summer_light,summer_bright,summer_mute', 'dewy', 'feminine,lovely,elegant', 'spring,summer', 'date,wedding_guest,daily', 25000, '/images/beauty/b021.jpg', '촉촉한 로즈 컬러가 여름 타입의 부드러운 혈색을 자연스럽게 표현합니다.'),
('코랄 크림 블러셔', 'Peach Archive', 'female', 'cheek', 'cream_blush', '코랄 크림', 'coral', 'warm', 'spring_light,spring_bright,spring_true', 'dewy', 'lovely,casual,feminine', 'spring,summer', 'daily,date,campus', 24000, '/images/beauty/b022.jpg', '코랄 크림 제형이 봄 타입의 맑은 생기를 피부에 자연스럽게 녹입니다.'),
('허니 베이지 메이크업 베이스', 'Peach Archive', 'unisex', 'base', 'makeup_base', '허니 베이지', 'beige', 'warm', 'spring_true,autumn_true,autumn_mute', 'glow', 'natural,minimal,casual', 'spring,fall', 'daily,travel,office', 30000, '/images/beauty/b023.jpg', '따뜻한 베이지 베이스가 웜 톤의 피부 온도감을 살리고 건조해 보이는 인상을 줄입니다.'),
('포슬린 핑크 쿠션', 'Clear Muse', 'female', 'base', 'cushion', '포슬린 핑크', 'pink', 'cool', 'summer_light,summer_bright', 'glow', 'lovely,feminine,natural', 'spring,summer', 'daily,date,wedding_guest', 36000, '/images/beauty/b024.jpg', '밝은 쿨 핑크 베이스가 여름 라이트 피부를 맑고 화사하게 보이게 합니다.'),
('에스프레소 컨투어 스틱', 'Nude Theory', 'unisex', 'cheek', 'contour', '에스프레소', 'brown', 'neutral', 'autumn_deep,winter_deep', 'matte', 'chic,modern,minimal', 'all', 'date,party,office', 22000, '/images/beauty/b025.jpg', '딥 타입에게 필요한 얼굴 대비감을 만들고 턱선과 코 음영을 또렷하게 정리합니다.'),
('피치 베이지 섀도우 팔레트', 'Peach Archive', 'female', 'eye', 'eye_palette', '피치 베이지', 'coral', 'warm', 'spring_light,spring_bright,spring_true', 'satin', 'lovely,natural,feminine', 'spring,summer', 'daily,date,campus', 32000, '/images/beauty/b026.jpg', '피치와 베이지 조합이 봄 타입의 맑은 눈매와 데일리 메이크업에 잘 맞습니다.'),
('뮤트 베이지 섀도우 팔레트', 'Nude Theory', 'unisex', 'eye', 'eye_palette', '뮤트 베이지', 'beige', 'neutral', 'summer_mute,autumn_mute', 'matte', 'minimal,natural,modern', 'all', 'daily,office,interview', 33000, '/images/beauty/b027.jpg', '낮은 채도의 베이지 음영이 뮤트 타입의 차분한 분위기를 해치지 않습니다.'),
('버건디 립 틴트', 'Velvet Dew', 'female', 'lip', 'tint', '버건디', 'burgundy', 'cool', 'winter_deep,autumn_deep', 'velvet', 'chic,luxury,elegant', 'fall,winter', 'date,party', 19000, '/images/beauty/b028.jpg', '딥 계열의 입체감을 살리는 버건디 컬러로 저녁 약속과 파티에 적합합니다.'),
('밀크 핑크 립스틱', 'Mauve Room', 'female', 'lip', 'lipstick', '밀크 핑크', 'pink', 'cool', 'summer_light,spring_light', 'sheer', 'lovely,feminine,natural', 'spring,summer', 'daily,date,campus', 23000, '/images/beauty/b029.jpg', '밝은 핑크가 라이트 타입에 부담 없이 올라가 청순한 혈색을 만듭니다.'),
('웜 누드 립스틱', 'Nude Theory', 'female', 'lip', 'lipstick', '웜 누드', 'beige', 'warm', 'spring_true,autumn_mute,autumn_true', 'satin', 'minimal,natural,elegant', 'all', 'daily,office,date', 24000, '/images/beauty/b030.jpg', '따뜻한 누드 베이지가 웜 톤 피부와 자연스럽게 연결되어 차분한 인상을 줍니다.'),
('클리어 매트 파우더', 'Clear Muse', 'unisex', 'base', 'powder', '클리어 매트', 'clear', 'all', 'spring_light,spring_bright,spring_true,summer_light,summer_bright,summer_mute,autumn_mute,autumn_true,autumn_deep,winter_bright,winter_true,winter_deep', 'matte', 'minimal,natural,modern', 'all', 'daily,office,interview,travel', 21000, '/images/beauty/b031.jpg', '색상 영향이 적고 유분과 번들거림을 정돈해 어떤 퍼스널컬러에도 사용하기 쉽습니다.'),
('듀이 픽싱 스프레이', 'Lune Glow', 'unisex', 'base', 'fixing_spray', '듀이 클리어', 'clear', 'all', 'spring_light,spring_bright,spring_true,summer_light,summer_bright,summer_mute,autumn_mute,autumn_true,autumn_deep,winter_bright,winter_true,winter_deep', 'dewy', 'natural,minimal,modern', 'all', 'daily,date,travel,party', 25000, '/images/beauty/b032.jpg', '색조를 바꾸지 않고 촉촉한 마감을 더해 계절과 상황에 폭넓게 사용할 수 있습니다.'),
('아이스 핑크 하이라이터', 'Prism Skin', 'female', 'cheek', 'highlighter', '아이스 핑크', 'pink', 'cool', 'winter_bright,summer_light,summer_bright', 'glow', 'chic,lovely,elegant', 'all', 'date,party,wedding_guest', 29000, '/images/beauty/b033.jpg', '차가운 핑크 광이 쿨 브라이트와 라이트 타입의 투명감을 살립니다.'),
('코코아 브로우 젤', 'Olive Veil', 'unisex', 'eye', 'brow_gel', '코코아', 'brown', 'warm', 'autumn_deep,autumn_true,spring_true', 'natural', 'natural,casual,dandy', 'all', 'daily,office,campus', 17000, '/images/beauty/b034.jpg', '따뜻한 브라운 눈썹 결을 만들어 웜 톤 헤어 컬러와 자연스럽게 연결됩니다.'),
('로즈 베이지 립 펜슬', 'Mauve Room', 'female', 'lip', 'lip_pencil', '로즈 베이지', 'pink', 'cool', 'summer_mute,summer_light', 'matte', 'feminine,elegant,natural', 'all', 'daily,date,wedding_guest', 16000, '/images/beauty/b035.jpg', '차분한 로즈 베이지가 여름 타입의 립 라인을 자연스럽게 정돈합니다.'),
('루비 레드 립스틱', 'Tone Lab', 'female', 'lip', 'lipstick', '루비 레드', 'red', 'cool', 'winter_bright,winter_true', 'satin', 'chic,elegant,luxury', 'all', 'date,party,wedding_guest', 28000, '/images/beauty/b036.jpg', '선명한 루비 레드가 겨울 브라이트의 대비감과 화려한 상황에 잘 맞습니다.'),
('메이플 블러셔', 'Bloom Lab', 'female', 'cheek', 'powder_blush', '메이플', 'orange', 'warm', 'autumn_true,autumn_deep', 'matte', 'natural,elegant,chic', 'fall,winter', 'daily,date,office', 23000, '/images/beauty/b037.jpg', '메이플 컬러가 가을 타입의 따뜻하고 깊은 피부 온도감을 살립니다.'),
('라이트 코랄 톤업 선크림', 'Peach Archive', 'unisex', 'skin_care', 'tone_up_sunscreen', '라이트 코랄', 'coral', 'warm', 'spring_light,spring_bright', 'glow', 'natural,lovely,casual', 'spring,summer', 'daily,campus,travel', 27000, '/images/beauty/b038.jpg', '코랄 기가 봄 타입의 생기를 더하고 낮 시간 외출 상황에 활용하기 좋습니다.'),
('소프트 베이지 프라이머', 'Nude Theory', 'unisex', 'base', 'primer', '소프트 베이지', 'beige', 'neutral', 'spring_light,summer_light,autumn_mute,summer_mute', 'natural', 'minimal,natural,modern', 'all', 'daily,office,interview', 26000, '/images/beauty/b039.jpg', '피부 요철을 자연스럽게 정리하고 색감 간섭이 적어 여러 톤에 대응하기 쉽습니다.'),
('누드 애프리콧 글로스', 'Peach Archive', 'female', 'lip', 'lip_gloss', '누드 애프리콧', 'coral', 'warm', 'spring_light,spring_true,autumn_true', 'glow', 'lovely,natural,casual', 'spring,summer', 'daily,date,campus', 15000, '/images/beauty/b040.jpg', '누드 코랄빛 광택이 웜 톤 피부에 자연스러운 생기를 더합니다.'),
('모브 그레이 섀도우', 'Mauve Room', 'unisex', 'eye', 'single_shadow', '모브 그레이', 'purple', 'cool', 'summer_mute,winter_true', 'matte', 'minimal,chic,modern', 'all', 'office,date,daily', 16000, '/images/beauty/b041.jpg', '쿨한 모브 그레이가 탁하지 않은 음영을 만들어 차분한 쿨 톤 메이크업에 좋습니다.'),
('블랙 브라운 라이너', 'Velvet Dew', 'unisex', 'eye', 'eyeliner', '블랙 브라운', 'brown', 'neutral', 'autumn_deep,winter_deep,winter_true', 'matte', 'chic,modern,natural', 'all', 'daily,date,party', 18000, '/images/beauty/b042.jpg', '블랙보다 부드럽지만 딥 타입의 눈매 대비를 유지해 데일리와 데이트에 모두 적합합니다.'),
('파스텔 라일락 팔레트', 'Prism Skin', 'female', 'eye', 'eye_palette', '파스텔 라일락', 'purple', 'cool', 'summer_light,summer_bright', 'satin', 'lovely,feminine,elegant', 'spring,summer', 'date,wedding_guest,campus', 34000, '/images/beauty/b043.jpg', '맑은 라일락이 여름 라이트와 브라이트의 투명한 이미지를 살립니다.'),
('시나몬 립밤', 'Bloom Lab', 'unisex', 'lip', 'lip_balm', '시나몬', 'brown', 'warm', 'autumn_mute,autumn_true,spring_true', 'sheer', 'natural,casual,minimal', 'fall,winter', 'daily,campus,travel', 12000, '/images/beauty/b044.jpg', '은은한 시나몬 컬러가 웜 톤에 자연스럽고 건조한 계절 데일리 케어에 좋습니다.'),
('쿨 로즈 쿠션', 'Clear Muse', 'unisex', 'base', 'cushion', '쿨 로즈', 'pink', 'cool', 'summer_light,summer_mute,winter_true', 'satin', 'minimal,natural,elegant', 'all', 'daily,office,date', 37000, '/images/beauty/b045.jpg', '쿨 로즈 베이스가 붉은기와 노란기를 균형 있게 보정해 쿨 톤 피부에 안정적입니다.'),
('골든 쉬머 섀도우', 'Lune Glow', 'female', 'eye', 'single_shadow', '골든 쉬머', 'gold', 'warm', 'spring_bright,spring_true,autumn_true', 'glow', 'lovely,luxury,elegant', 'all', 'date,party,wedding_guest', 17000, '/images/beauty/b046.jpg', '따뜻한 골드 광이 웜 톤의 눈가에 생기와 화려함을 더합니다.'),
('벨벳 누드 틴트', 'Velvet Dew', 'female', 'lip', 'tint', '벨벳 누드', 'beige', 'warm', 'autumn_mute,spring_true', 'velvet', 'minimal,natural,elegant', 'all', 'daily,office,date', 19000, '/images/beauty/b047.jpg', '저채도 누드 컬러가 가을 뮤트의 차분함과 봄 트루의 따뜻함에 자연스럽습니다.'),
('베리 핑크 틴트', 'Mauve Room', 'female', 'lip', 'tint', '베리 핑크', 'pink', 'cool', 'summer_bright,winter_bright', 'glow', 'lovely,chic,feminine', 'spring,summer', 'date,party,daily', 18000, '/images/beauty/b048.jpg', '맑은 베리 핑크가 쿨 브라이트 타입의 생기와 선명도를 높입니다.'),
('뉴트럴 클리어 브로우 왁스', 'Clear Muse', 'unisex', 'eye', 'brow_wax', '클리어', 'clear', 'all', 'spring_light,spring_bright,spring_true,summer_light,summer_bright,summer_mute,autumn_mute,autumn_true,autumn_deep,winter_bright,winter_true,winter_deep', 'natural', 'minimal,natural,modern', 'all', 'daily,office,campus,interview', 14000, '/images/beauty/b049.jpg', '색상 영향을 주지 않고 눈썹 결만 정돈해 모든 퍼스널컬러에 적용하기 쉽습니다.'),
('다크 체리 립 라커', 'Tone Lab', 'female', 'lip', 'lip_lacquer', '다크 체리', 'burgundy', 'cool', 'winter_deep,winter_true', 'velvet', 'chic,luxury,elegant', 'fall,winter', 'date,party', 29000, '/images/beauty/b050.jpg', '다크 체리 컬러가 겨울 딥의 고대비 이미지를 강화하고 포인트 메이크업에 적합합니다.');

-- Example 1: 겨울 딥 + 스트레이트 체형 + 데이트 상황 + 시크 스타일 패션 상품 추천
SELECT
  product_id,
  product_name,
  brand_name,
  category,
  sub_category,
  price,
  image_url,
  recommendation_reason
FROM fashion_products
WHERE FIND_IN_SET('winter_deep', personal_color_type)
  AND FIND_IN_SET('straight', body_type)
  AND FIND_IN_SET('date', situation)
  AND FIND_IN_SET('chic', style_tag)
ORDER BY price ASC;

-- Example 2: 성별까지 포함한 패션 상품 추천
SELECT
  product_id,
  product_name,
  brand_name,
  price,
  image_url,
  recommendation_reason
FROM fashion_products
WHERE FIND_IN_SET('winter_deep', personal_color_type)
  AND FIND_IN_SET('straight', body_type)
  AND FIND_IN_SET('date', situation)
  AND FIND_IN_SET('chic', style_tag)
  AND (FIND_IN_SET('female', gender_target) OR FIND_IN_SET('unisex', gender_target))
ORDER BY price ASC
LIMIT 12;

-- Example 3: 피부톤/퍼스널컬러 결과 기반 뷰티 상품 추천
SELECT
  product_id,
  product_name,
  brand_name,
  category,
  sub_category,
  shade_name,
  finish_type,
  price,
  image_url,
  recommendation_reason
FROM beauty_products
WHERE FIND_IN_SET('winter_deep', personal_color_type)
  AND skin_tone IN ('cool', 'neutral', 'all')
  AND FIND_IN_SET('date', situation)
ORDER BY price ASC
LIMIT 12;

-- Example 4: 조건별 점수 기반 추천 랭킹
SELECT
  product_id,
  product_name,
  brand_name,
  price,
  image_url,
  recommendation_reason,
  (
    IF(FIND_IN_SET('winter_deep', personal_color_type), 40, 0) +
    IF(FIND_IN_SET('straight', body_type), 25, 0) +
    IF(FIND_IN_SET('date', situation), 20, 0) +
    IF(FIND_IN_SET('chic', style_tag), 15, 0)
  ) AS match_score
FROM fashion_products
HAVING match_score >= 60
ORDER BY match_score DESC, price ASC
LIMIT 12;
