// 图册拆解数据样本
// 数据来源：国网南网主网与配网线路子件U9料号匹配汇总20260805.xlsx
// 说明：
//   串     —— 取自「套」段有串型编号的记录，有单位（套），无数量
//   子件   —— 取自「付/件/支/只/片/组」段，按品类与串型合理配对
//   U9料号 —— 源表「技术ID」列有值则填入，无值留空（对应风险规则 HG-R06 U9关联缺失）

export const atlasData = {
  '国网南网主网与配网线路子件U9料号匹配汇总20260805.xlsx': {
    info: {
      name: '国网南网主网与配网线路子件U9料号匹配汇总',
      version: 'V2026.08.05',
      type: 'U9辅助映射',
      uploadDate: '2026-08-05',
      source: '客户手工录入',
      totalStrings: 8,
      totalComponents: 47
    },
    strings: [
      {
        id: '8N42-5580-84P1',
        name: '±800kV导线耐张串',
        unit: '套',
        conductor: '待确认',
        imageRef: 'U9汇总 · 套段',
        components: [
          { code: 'NY-150/20A(B)', name: '耐张线夹-导线液压型耐张线夹', unit: '只', techId: '' },
          { code: 'NL-120-240/30', name: '耐张线夹-裸导线用预绞式耐张线夹', unit: '只', techId: '' },
          { code: 'U-10', name: '联结金具-U型挂环', unit: '件', techId: '' },
          { code: 'Q-7', name: '联结金具-球头挂环', unit: '件', techId: '' },
          { code: 'Z-10', name: '联结金具-直角挂板', unit: '件', techId: '' },
          { code: 'DB-10', name: '联结金具-调整板', unit: '件', techId: '' },
          { code: 'FYH-300/50', name: '保护金具-预绞丝护线条', unit: '付', techId: '9111-500028303-00006' }
        ]
      },
      {
        id: '8GSTV-50-16H-2B',
        name: '±800kV导线跳线串',
        unit: '套',
        conductor: '待确认',
        imageRef: 'U9汇总 · 套段',
        components: [
          { code: 'TZ-2', name: '跳线金具-支撑线夹', unit: '只', techId: '' },
          { code: 'XTG-22', name: '跳线金具-跳线托架', unit: '只', techId: '' },
          { code: 'MGF-48/39', name: '跳线金具-封端盖', unit: '只', techId: '' },
          { code: 'XT-6022', name: '悬垂线夹-跳线悬垂线夹', unit: '只', techId: '' },
          { code: 'WS-0770', name: '联结金具-WS型碗头挂板', unit: '只', techId: '' },
          { code: 'U-16', name: '联结金具-U型挂环', unit: '件', techId: '' }
        ]
      },
      {
        id: '8V32-5565-55H',
        name: '±800kV导线悬垂串',
        unit: '套',
        conductor: '待确认',
        imageRef: 'U9汇总 · 套段',
        components: [
          { code: 'XG-12022', name: '悬垂线夹-提包式悬垂线夹', unit: '只', techId: '' },
          { code: 'CL-120-240/30', name: '悬垂线夹-预绞式悬垂线夹', unit: '只', techId: '' },
          { code: 'WS-1085', name: '联结金具-WS型碗头挂板', unit: '只', techId: '' },
          { code: 'P-10', name: '联结金具-平行挂板', unit: '件', techId: '' },
          { code: 'PH-10', name: '联结金具-延长环', unit: '件', techId: '' }
        ]
      },
      {
        id: '10N21-4060-30P',
        name: '1000kV导线耐张串,300kN,架用,侧环',
        unit: '套',
        conductor: '待确认',
        imageRef: 'U9汇总 · 套段',
        components: [
          { code: 'NY-240/30A(B)', name: '耐张线夹-导线液压型耐张线夹', unit: '只', techId: '' },
          { code: 'NL-120-300/25', name: '耐张线夹-裸导线用预绞式耐张线夹', unit: '只', techId: '' },
          { code: 'U-21', name: '联结金具-U型挂环', unit: '件', techId: '' },
          { code: 'QP-10', name: '联结金具-球头挂环', unit: '件', techId: '' },
          { code: 'L-1040', name: '联结金具-联板', unit: '件', techId: '' },
          { code: 'FDN-1/2', name: '保护金具-防振锤', unit: '付', techId: '' }
        ]
      },
      {
        id: '10GSTIC-40-21H',
        name: '1000kV导线采跳线串,边相,笼式刚性,210kN,悬垂式,单回路',
        unit: '套',
        conductor: '适用于JL/G1A-900/40',
        imageRef: 'U9汇总 · 套段',
        components: [
          { code: 'TZ2-1/250', name: '跳线金具-支撑线夹', unit: '只', techId: '' },
          { code: 'XTG-28', name: '跳线金具-跳线托架', unit: '只', techId: '' },
          { code: 'XT-8022', name: '悬垂线夹-跳线悬垂线夹', unit: '只', techId: '' },
          { code: 'WS-1290', name: '联结金具-WS型碗头挂板', unit: '只', techId: '' }
        ]
      },
      {
        id: '10HN32-4060-55PB',
        name: '1000kV导线耐张串,550kN,三联,双挂点,换位或分体,侧环',
        unit: '套',
        conductor: '待确认',
        imageRef: 'U9汇总 · 套段',
        components: [
          { code: 'NY-300/25A(B)', name: '耐张线夹-导线液压型耐张线夹', unit: '只', techId: '' },
          { code: 'NL-120-300/40', name: '耐张线夹-裸导线用预绞式耐张线夹', unit: '只', techId: '' },
          { code: 'NY-150BG', name: '耐张线夹-液压型', unit: '付', techId: '' },
          { code: 'U-25', name: '联结金具-U型挂环', unit: '件', techId: '' },
          { code: 'Z-7', name: '联结金具-直角挂板', unit: '件', techId: '' },
          { code: 'PT-12', name: '联结金具-调整板', unit: '件', techId: '' },
          { code: 'FJG-220/22', name: '保护金具-间隔棒', unit: '支', techId: '' }
        ]
      },
      {
        id: '10XC2-4060-30H',
        name: '1000kV导线悬垂串,300kN,双联,双挂点,提包单线夹,I型,普通',
        unit: '套',
        conductor: 'JL/G1A-500/35-45/7,JL/G1A-500/45-48/7',
        imageRef: 'U9汇总 · 套段',
        components: [
          { code: 'XGS-12028/400', name: '悬垂线夹-垂直双分裂提包式悬垂线夹', unit: '只', techId: '' },
          { code: 'XG-12028', name: '悬垂线夹-提包式悬垂线夹', unit: '只', techId: '' },
          { code: 'WS-1695', name: '联结金具-WS型碗头挂板', unit: '只', techId: '' },
          { code: 'UB-1080', name: '连接金具-UB挂板', unit: '只', techId: '' },
          { code: 'FDN-2/G', name: '保护金具-防振锤', unit: '付', techId: '' },
          { code: 'FZC-10', name: '保护金具-重锤片', unit: '片', techId: '' },
          { code: 'FZJ-15Y', name: '保护金具-重锤座', unit: '只', techId: '' }
        ]
      },
      {
        id: '10S1Q2-40-21H-1',
        name: '1000kV导线跳线串,换位塔牵引跳线,单串,210kN,牵引式,双回路',
        unit: '套',
        conductor: '待确认',
        imageRef: 'U9汇总 · 套段',
        components: [
          { code: 'TZ-3', name: '跳线金具-支撑线夹', unit: '只', techId: '' },
          { code: 'XTG-34', name: '跳线金具-跳线托架', unit: '只', techId: '' },
          { code: 'MGF-60/51', name: '跳线金具-封端盖', unit: '只', techId: '' },
          { code: 'JYT-150/20', name: '接续金具-跳线线夹', unit: '件', techId: '' },
          { code: 'JBB-1', name: '接续金具-并沟线夹', unit: '件', techId: '' },
          { code: 'UL-10', name: '拉线金具-U型挂环', unit: '件', techId: '' }
        ]
      }
    ]
  },
  '国网图册收集 · 750kV 输电线路金具分册': {
    info: {
      name: '国网图册收集 · 750kV 输电线路金具分册',
      version: 'V2026.09.15',
      type: '图册结构化数据',
      uploadDate: '2026-09-15',
      source: 'PDF结构化提取',
      册号: '750kV分册',
      totalStrings: 3,
      totalComponents: 18
    },
    strings: [
      {
        id: '750N-4060-55P',
        name: '750kV导线耐张串,550kN,三联,双挂点,塔用,侧环',
        unit: '套',
        conductor: 'JL/G3A-630/45',
        imageRef: '图3-18',
        page: 'P23',
        components: [
          { code: 'NY-630/45', name: '耐张线夹-导线液压型耐张线夹', unit: '只', techId: '' },
          { code: 'NL-120-400/35', name: '耐张线夹-裸导线用预绞式耐张线夹', unit: '只', techId: '' },
          { code: 'U-25', name: '联结金具-U型挂环', unit: '件', techId: '' },
          { code: 'Q-7', name: '联结金具-球头挂环', unit: '件', techId: '' },
          { code: 'DB-12', name: '联结金具-调整板', unit: '件', techId: '' },
          { code: 'L-1040', name: '联结金具-联板', unit: '件', techId: '' },
          { code: 'FYH-300/50', name: '保护金具-预绞丝护线条', unit: '付', techId: '9111-500028303-00006' }
        ]
      },
      {
        id: '750V2-4060-30H',
        name: '750kV导线悬垂串,300kN,双联,双挂点,提包单线夹,I型,普通',
        unit: '套',
        conductor: 'JL/G3A-630/45',
        imageRef: '图3-25',
        page: 'P28',
        components: [
          { code: 'XG-12034', name: '悬垂线夹-提包式悬垂线夹', unit: '只', techId: '' },
          { code: 'CL-160-300/25', name: '悬垂线夹-预绞式悬垂线夹', unit: '只', techId: '' },
          { code: 'WS-21100', name: '联结金具-WS型碗头挂板', unit: '只', techId: '' },
          { code: 'UB-12100', name: '连接金具-UB挂板', unit: '只', techId: '' },
          { code: 'QP-1260', name: '连接金具-QP球头挂环', unit: '只', techId: '' },
          { code: 'FDN-3/4', name: '保护金具-防振锤', unit: '付', techId: '' }
        ]
      },
      {
        id: '750GSTIC-40-21H',
        name: '750kV导线跳线串,边相,笼式刚性,210kN,悬垂式,单回路',
        unit: '套',
        conductor: '待确认',
        imageRef: '图3-31',
        page: 'P33',
        components: [
          { code: 'TZ2-1/250', name: '跳线金具-支撑线夹', unit: '只', techId: '' },
          { code: 'XTG-28', name: '跳线金具-跳线托架', unit: '只', techId: '' },
          { code: 'XT-6034', name: '悬垂线夹-跳线悬垂线夹', unit: '只', techId: '' },
          { code: 'WS-1695', name: '联结金具-WS型碗头挂板', unit: '只', techId: '' },
          { code: 'U-16', name: '联结金具-U型挂环', unit: '件', techId: '' }
        ]
      }
    ]
  },
  '国网图册收集 · 220kV 输电线路金具分册': {
    info: {
      name: '国网图册收集 · 220kV 输电线路金具分册',
      version: 'V2026.09.01',
      type: '图册结构化数据',
      uploadDate: '2026-09-01',
      source: 'PDF结构化提取',
      册号: '220kV分册',
      totalStrings: 4,
      totalComponents: 26
    },
    strings: [
      {
        id: '220N-4060-30P',
        name: '220kV导线耐张串,300kN,双联,单挂点,塔用,侧环',
        unit: '套',
        conductor: 'LGJ-400/35',
        imageRef: '图5-12',
        page: 'P18',
        components: [
          { code: 'NY-240/30A(B)', name: '耐张线夹-导线液压型耐张线夹', unit: '只', techId: '' },
          { code: 'NL-120-240/30', name: '耐张线夹-裸导线用预绞式耐张线夹', unit: '只', techId: '' },
          { code: 'U-16', name: '联结金具-U型挂环', unit: '件', techId: '' },
          { code: 'Q-7', name: '联结金具-球头挂环', unit: '件', techId: '' },
          { code: 'Z-10', name: '联结金具-直角挂板', unit: '件', techId: '' },
          { code: 'DB-10', name: '联结金具-调整板', unit: '件', techId: '' }
        ]
      },
      {
        id: '220XG-12022',
        name: '220kV导线悬垂串,100kN,单联,单挂点,提包式,V型,普通',
        unit: '套',
        conductor: 'LGJ-400/35',
        imageRef: '图5-08',
        page: 'P15',
        components: [
          { code: 'XG-12022', name: '悬垂线夹-提包式悬垂线夹', unit: '只', techId: '' },
          { code: 'CL-120-400/35', name: '悬垂线夹-预绞式悬垂线夹', unit: '只', techId: '' },
          { code: 'WS-1085', name: '联结金具-WS型碗头挂板', unit: '只', techId: '' },
          { code: 'P-10', name: '联结金具-平行挂板', unit: '件', techId: '' },
          { code: 'FDN-1/2', name: '保护金具-防振锤', unit: '付', techId: '' }
        ]
      },
      {
        id: '220D-100G',
        name: '220kV地线耐张串,100kN,单联,单挂点,塔用',
        unit: '套',
        conductor: 'GJ-80',
        imageRef: '图5-20',
        page: 'P22',
        components: [
          { code: 'NY-100G', name: '耐张线夹-地线液压型耐张线夹', unit: '只', techId: '' },
          { code: 'NL-70-80G', name: '耐张线夹-地线预绞式耐张线夹', unit: '只', techId: '' },
          { code: 'U-10', name: '联结金具-U型挂环', unit: '件', techId: '' },
          { code: 'Z-7', name: '联结金具-直角挂板', unit: '件', techId: '' },
          { code: 'JY-100G', name: '接续金具-地线接续管', unit: '付', techId: '' }
        ]
      },
      {
        id: '220XT-6022',
        name: '220kV导线跳线串,70kN,单串,悬垂式,单回路',
        unit: '套',
        conductor: 'LGJ-400/35',
        imageRef: '图5-31',
        page: 'P26',
        components: [
          { code: 'XT-6022', name: '悬垂线夹-跳线悬垂线夹', unit: '只', techId: '' },
          { code: 'TZ-2', name: '跳线金具-支撑线夹', unit: '只', techId: '' },
          { code: 'WS-0770', name: '联结金具-WS型碗头挂板', unit: '只', techId: '' },
          { code: 'JBB-1', name: '接续金具-并沟线夹', unit: '件', techId: '' },
          { code: 'JC-1', name: '接续金具-铜绞线C型线夹', unit: '件', techId: '' }
        ]
      }
    ]
  }
}
