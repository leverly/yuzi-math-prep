/* ==========================================================
   真题练习题库（2026-11-25 建）
   ----------------------------------------------------------
   站点只练真题。130 道全部来自五套西城期末卷，无原创改编题。

   qtype 由答案可得性决定：
     single 单选 —— 选择题且提取到官方答案字母
     calc   计算 —— 填空类且提取到「故答案为」
     big    大题 —— 解答题（多小问，不自动判分，只给解答）

   hasAnswer=false 的题（2022-23 整套 26 题）只有题干没有答案，
   页面标「无官方答案」，只展示不判分。

   officialKey 保留官方答案原文，用于核验页对照。
   ========================================================== */

export const EXAM_BANK = [
 {
  "id": "p2021-q1",
  "paperId": "p2021",
  "year": "2021—2022",
  "no": 1,
  "qtype": "single",
  "chapter": "ch-rational",
  "cat": "概念",
  "score": 2,
  "diff": "easy",
  "topic": "绝对值",
  "name": "绝对值",
  "bonus": false,
  "hasAnswer": true,
  "stemText": "﹣5的绝对值是（ ）",
  "stemParts": [
   {
    "t": "text",
    "v": ""
   },
   {
    "t": "text",
    "v": "﹣"
   },
   {
    "t": "text",
    "v": "5"
   },
   {
    "t": "text",
    "v": "的绝对值是（"
   },
   {
    "t": "text",
    "v": " "
   },
   {
    "t": "text",
    "v": "）"
   }
  ],
  "rawParas": [
   "1. ﹣5的绝对值是（ ）",
   "A. 5B. ﹣5C. ⟨公式⟩D. ⟨公式⟩"
  ],
  "options": [
   "5",
   "﹣5",
   "⟨公式⟩",
   "⟨公式⟩"
  ],
  "optionParts": [
   [
    {
     "t": "text",
     "v": "5"
    }
   ],
   [
    {
     "t": "text",
     "v": "﹣5"
    }
   ],
   [
    {
     "t": "img",
     "rid": "rId7",
     "src": "media/image3.png",
     "kind": "formula"
    }
   ],
   [
    {
     "t": "img",
     "rid": "rId9",
     "src": "media/image4.png",
     "kind": "formula"
    }
   ]
  ],
  "key": 0,
  "answer": "5",
  "officialKey": "A"
 },
 {
  "id": "p2021-q2",
  "paperId": "p2021",
  "year": "2021—2022",
  "no": 2,
  "qtype": "single",
  "chapter": "ch-op",
  "cat": "概念",
  "score": 2,
  "diff": "easy",
  "topic": "科学记数法",
  "name": "科学记数法",
  "bonus": false,
  "hasAnswer": true,
  "stemText": "云南的澄江化石地世界自然遗产博物馆升级改造完工，馆内所收藏的约520000000年前的澄江生物群化石，展示了寒武纪时期的生物多样化场景．将520000000用科学记数法表示应为（    ）",
  "stemParts": [
   {
    "t": "text",
    "v": ""
   },
   {
    "t": "text",
    "v": "云南的澄江化石地世界自然遗产博物馆升级改造完工，馆内所收藏的约"
   },
   {
    "t": "text",
    "v": "520000000"
   },
   {
    "t": "text",
    "v": "年前的澄江生物群化石，展示了寒武纪时期的生物多样化场景．将"
   },
   {
    "t": "text",
    "v": "520000000"
   },
   {
    "t": "text",
    "v": "用科学记数法表示应为（    ）"
   }
  ],
  "rawParas": [
   "2. 云南的澄江化石地世界自然遗产博物馆升级改造完工，馆内所收藏的约520000000年前的澄江生物群化石，展示了寒武纪时期的生物多样化场景．将520000000用科学记数法表示应为（    ）",
   "A. ⟨公式⟩B. ⟨公式⟩C. ⟨公式⟩D. ⟨公式⟩"
  ],
  "options": [
   "⟨公式⟩",
   "⟨公式⟩",
   "⟨公式⟩",
   "⟨公式⟩"
  ],
  "optionParts": [
   [
    {
     "t": "img",
     "rid": "rId11",
     "src": "media/image5.png",
     "kind": "formula"
    }
   ],
   [
    {
     "t": "img",
     "rid": "rId13",
     "src": "media/image6.png",
     "kind": "formula"
    }
   ],
   [
    {
     "t": "img",
     "rid": "rId15",
     "src": "media/image7.png",
     "kind": "formula"
    }
   ],
   [
    {
     "t": "img",
     "rid": "rId17",
     "src": "media/image8.png",
     "kind": "formula"
    }
   ]
  ],
  "key": 1,
  "answer": "⟨公式⟩",
  "officialKey": "B"
 },
 {
  "id": "p2021-q3",
  "paperId": "p2021",
  "year": "2021—2022",
  "no": 3,
  "qtype": "single",
  "chapter": "ch-rational",
  "cat": "概念",
  "score": 2,
  "diff": "easy",
  "topic": "数轴读符号",
  "name": "数轴比较大小",
  "bonus": false,
  "hasAnswer": true,
  "stemText": "如图，数轴上的点A表示的数可能是(   ) ⟨公式⟩⟨公式⟩",
  "stemParts": [
   {
    "t": "text",
    "v": ""
   },
   {
    "t": "text",
    "v": "如图，数轴上的点"
   },
   {
    "t": "text",
    "v": "A"
   },
   {
    "t": "text",
    "v": "表示的数可能是("
   },
   {
    "t": "text",
    "v": "   "
   },
   {
    "t": "text",
    "v": ")"
   },
   {
    "t": "text",
    "v": " "
   },
   {
    "t": "break"
   },
   {
    "t": "img",
    "rid": "rId19",
    "src": "media/image9.png",
    "kind": "figure"
   }
  ],
  "rawParas": [
   "3. 如图，数轴上的点A表示的数可能是(   ) ",
   "⟨公式⟩",
   "A. ⟨公式⟩B. ⟨公式⟩C. ⟨公式⟩D. ⟨公式⟩"
  ],
  "options": [
   "⟨公式⟩",
   "⟨公式⟩",
   "⟨公式⟩",
   "⟨公式⟩"
  ],
  "optionParts": [
   [
    {
     "t": "img",
     "rid": "rId20",
     "src": "media/image10.png",
     "kind": "formula"
    }
   ],
   [
    {
     "t": "img",
     "rid": "rId22",
     "src": "media/image11.png",
     "kind": "formula"
    }
   ],
   [
    {
     "t": "img",
     "rid": "rId24",
     "src": "media/image12.png",
     "kind": "formula"
    }
   ],
   [
    {
     "t": "img",
     "rid": "rId26",
     "src": "media/image13.png",
     "kind": "formula"
    }
   ]
  ],
  "key": 3,
  "answer": "⟨公式⟩",
  "officialKey": "D"
 },
 {
  "id": "p2021-q4",
  "paperId": "p2021",
  "year": "2021—2022",
  "no": 4,
  "qtype": "single",
  "chapter": "ch-poly",
  "cat": "计算",
  "score": 2,
  "diff": "easy",
  "topic": "合并同类项辨析",
  "name": "合并同类项辨析",
  "bonus": false,
  "hasAnswer": true,
  "stemText": "下列计算正确的是（    ）",
  "stemParts": [
   {
    "t": "text",
    "v": ""
   },
   {
    "t": "text",
    "v": "下列计算正确的是（    ）"
   }
  ],
  "rawParas": [
   "4. 下列计算正确的是（    ）",
   "A. ⟨公式⟩B. ⟨公式⟩",
   "C. ⟨公式⟩D. ⟨公式⟩"
  ],
  "options": [
   "⟨公式⟩",
   "⟨公式⟩",
   "⟨公式⟩",
   "⟨公式⟩"
  ],
  "optionParts": [
   [
    {
     "t": "img",
     "rid": "rId28",
     "src": "media/image14.png",
     "kind": "formula"
    }
   ],
   [
    {
     "t": "img",
     "rid": "rId30",
     "src": "media/image15.png",
     "kind": "formula"
    }
   ],
   [
    {
     "t": "img",
     "rid": "rId32",
     "src": "media/image16.png",
     "kind": "formula"
    }
   ],
   [
    {
     "t": "img",
     "rid": "rId34",
     "src": "media/image17.png",
     "kind": "formula"
    }
   ]
  ],
  "key": 1,
  "answer": "⟨公式⟩",
  "officialKey": "B"
 },
 {
  "id": "p2021-q5",
  "paperId": "p2021",
  "year": "2021—2022",
  "no": 5,
  "qtype": "single",
  "chapter": "ch-eq",
  "cat": "建模",
  "score": 2,
  "diff": "mid",
  "topic": "余角补角",
  "name": "余角补角列方程",
  "bonus": false,
  "hasAnswer": true,
  "stemText": "一个角的余角比它的补角的⟨公式⟩多⟨公式⟩，设这个角为⟨公式⟩，下列关于⟨公式⟩的方程中，正确的是（    ）",
  "stemParts": [
   {
    "t": "text",
    "v": ""
   },
   {
    "t": "text",
    "v": "一个角的余角比它的补角的"
   },
   {
    "t": "img",
    "rid": "rId36",
    "src": "media/image18.png",
    "kind": "formula"
   },
   {
    "t": "text",
    "v": "多"
   },
   {
    "t": "img",
    "rid": "rId38",
    "src": "media/image19.png",
    "kind": "formula"
   },
   {
    "t": "text",
    "v": "，设这个角为"
   },
   {
    "t": "img",
    "rid": "rId40",
    "src": "media/image20.png",
    "kind": "formula"
   },
   {
    "t": "text",
    "v": "，下列关于"
   },
   {
    "t": "img",
    "rid": "rId40",
    "src": "media/image20.png",
    "kind": "formula"
   },
   {
    "t": "text",
    "v": "的方程中，正确的是（"
   },
   {
    "t": "text",
    "v": "    "
   },
   {
    "t": "text",
    "v": "）"
   }
  ],
  "rawParas": [
   "5. 一个角的余角比它的补角的⟨公式⟩多⟨公式⟩，设这个角为⟨公式⟩，下列关于⟨公式⟩的方程中，正确的是（    ）",
   "A. ⟨公式⟩B. ⟨公式⟩",
   "C. ⟨公式⟩D. ⟨公式⟩"
  ],
  "options": [
   "⟨公式⟩",
   "⟨公式⟩",
   "⟨公式⟩",
   "⟨公式⟩"
  ],
  "optionParts": [
   [
    {
     "t": "img",
     "rid": "rId43",
     "src": "media/image21.png",
     "kind": "formula"
    }
   ],
   [
    {
     "t": "img",
     "rid": "rId45",
     "src": "media/image22.png",
     "kind": "formula"
    }
   ],
   [
    {
     "t": "img",
     "rid": "rId47",
     "src": "media/image23.png",
     "kind": "formula"
    }
   ],
   [
    {
     "t": "img",
     "rid": "rId49",
     "src": "media/image24.png",
     "kind": "formula"
    }
   ]
  ],
  "key": 0,
  "answer": "⟨公式⟩",
  "officialKey": "A"
 },
 {
  "id": "p2021-q6",
  "paperId": "p2021",
  "year": "2021—2022",
  "no": 6,
  "qtype": "single",
  "chapter": "ch-poly",
  "cat": "计算",
  "score": 2,
  "diff": "mid",
  "topic": "整式加减（图形边长）",
  "name": "整式加减（图形边长）",
  "bonus": false,
  "hasAnswer": true,
  "stemText": "我国曾发行过一款如右图所示的国家重点保护野生动物（Ⅰ级）邮票小全张，设计者巧妙地将“野牦牛”和“黑颈鹤”这两枚不同规格的过桥票（无邮政铭记和面值的附票，在图中标记为①，②），与其他10枚尺寸相同的普通邮票组合在一起构成一个长方形，整个画面和谐统一，以下关于图中所示的三种规格邮票边长的数量关系的结论中，正确的是（    ）⟨公式⟩⟨公式⟩",
  "stemParts": [
   {
    "t": "text",
    "v": ""
   },
   {
    "t": "text",
    "v": "我国曾发行过一款如右图所示的国家重点保护野生动物（Ⅰ级）邮票小全张，设计者巧妙地将“野牦牛”和“黑颈鹤”这两枚不同规格的过桥票（无邮政铭记和面值的附票，在图中标记为①，②），与其他"
   },
   {
    "t": "text",
    "v": "10"
   },
   {
    "t": "text",
    "v": "枚尺寸相同的普通邮票组合在一起构成一个长方形，整个画面和谐统一，以下关于图中所示的三种规格邮票边长的数量关系的结论中，正确的是（    ）"
   },
   {
    "t": "break"
   },
   {
    "t": "img",
    "rid": "rId51",
    "src": "media/image25.png",
    "kind": "figure"
   }
  ],
  "rawParas": [
   "6. 我国曾发行过一款如右图所示的国家重点保护野生动物（Ⅰ级）邮票小全张，设计者巧妙地将“野牦牛”和“黑颈鹤”这两枚不同规格的过桥票（无邮政铭记和面值的附票，在图中标记为①，②），与其他10枚尺寸相同的普通邮票组合在一起构成一个长方形，整个画面和谐统一，以下关于图中所示的三种规格邮票边长的数量关系的结论中，正确的是（    ）",
   "⟨公式⟩",
   "A. ⟨公式⟩B. ⟨公式⟩C. ⟨公式⟩D. ⟨公式⟩"
  ],
  "options": [
   "⟨公式⟩",
   "⟨公式⟩",
   "⟨公式⟩",
   "⟨公式⟩"
  ],
  "optionParts": [
   [
    {
     "t": "img",
     "rid": "rId52",
     "src": "media/image26.png",
     "kind": "formula"
    }
   ],
   [
    {
     "t": "img",
     "rid": "rId54",
     "src": "media/image27.png",
     "kind": "formula"
    }
   ],
   [
    {
     "t": "img",
     "rid": "rId56",
     "src": "media/image28.png",
     "kind": "formula"
    }
   ],
   [
    {
     "t": "img",
     "rid": "rId58",
     "src": "media/image29.png",
     "kind": "formula"
    }
   ]
  ],
  "key": 3,
  "answer": "⟨公式⟩",
  "officialKey": "D"
 },
 {
  "id": "p2021-q7",
  "paperId": "p2021",
  "year": "2021—2022",
  "no": 7,
  "qtype": "single",
  "chapter": "ch-eq",
  "cat": "概念",
  "score": 2,
  "diff": "mid",
  "topic": "方程变形与等式性质",
  "name": "方程变形辨析",
  "bonus": false,
  "hasAnswer": true,
  "stemText": "下列方程变形中，正确的是（  ）",
  "stemParts": [
   {
    "t": "text",
    "v": ""
   },
   {
    "t": "text",
    "v": "下列方程变形中，正确的是（"
   },
   {
    "t": "text",
    "v": "  "
   },
   {
    "t": "text",
    "v": "）"
   }
  ],
  "rawParas": [
   "7. 下列方程变形中，正确的是（  ）",
   "A. 方程⟨公式⟩，移项得⟨公式⟩",
   "B. 方程⟨公式⟩，系数化为1得⟨公式⟩",
   "C. 方程⟨公式⟩，去括号得⟨公式⟩",
   "D. 方程⟨公式⟩，去分母得⟨公式⟩"
  ],
  "options": [
   "方程⟨公式⟩，移项得⟨公式⟩",
   "方程⟨公式⟩，系数化为1得⟨公式⟩",
   "方程⟨公式⟩，去括号得⟨公式⟩",
   "方程⟨公式⟩，去分母得⟨公式⟩"
  ],
  "optionParts": [
   [
    {
     "t": "text",
     "v": "方程"
    },
    {
     "t": "img",
     "rid": "rId60",
     "src": "media/image30.png",
     "kind": "formula"
    },
    {
     "t": "text",
     "v": "，移项得"
    },
    {
     "t": "img",
     "rid": "rId62",
     "src": "media/image31.png",
     "kind": "formula"
    }
   ],
   [
    {
     "t": "text",
     "v": "方程"
    },
    {
     "t": "img",
     "rid": "rId64",
     "src": "media/image32.png",
     "kind": "formula"
    },
    {
     "t": "text",
     "v": "，系数化为1得"
    },
    {
     "t": "img",
     "rid": "rId66",
     "src": "media/image33.png",
     "kind": "formula"
    }
   ],
   [
    {
     "t": "text",
     "v": "方程"
    },
    {
     "t": "img",
     "rid": "rId68",
     "src": "media/image34.png",
     "kind": "formula"
    },
    {
     "t": "text",
     "v": "，去括号得"
    },
    {
     "t": "img",
     "rid": "rId70",
     "src": "media/image35.png",
     "kind": "formula"
    }
   ],
   [
    {
     "t": "text",
     "v": "方程"
    },
    {
     "t": "img",
     "rid": "rId72",
     "src": "media/image36.png",
     "kind": "formula"
    },
    {
     "t": "text",
     "v": "，去分母得"
    },
    {
     "t": "img",
     "rid": "rId74",
     "src": "media/image37.png",
     "kind": "formula"
    }
   ]
  ],
  "key": 2,
  "answer": "方程⟨公式⟩，去括号得⟨公式⟩",
  "officialKey": "C"
 },
 {
  "id": "p2021-q8",
  "paperId": "p2021",
  "year": "2021—2022",
  "no": 8,
  "qtype": "single",
  "chapter": "ch-geo",
  "cat": "空间",
  "score": 2,
  "diff": "hard",
  "topic": "三视图",
  "name": "三视图与立体拼搭",
  "bonus": false,
  "hasAnswer": true,
  "stemText": "用6个棱长为1的小正方体可以粘合形成不同形状的积木，将如图所示的两块积木摆放在桌面上，再从下列四块积木中选择一块，能搭成一个长、宽、高分别为3、2、3的长方体的是（    ）⟨公式⟩⟨公式⟩",
  "stemParts": [
   {
    "t": "text",
    "v": ""
   },
   {
    "t": "text",
    "v": "用"
   },
   {
    "t": "text",
    "v": "6"
   },
   {
    "t": "text",
    "v": "个棱长为"
   },
   {
    "t": "text",
    "v": "1"
   },
   {
    "t": "text",
    "v": "的小正方体可以粘合形成不同形状的积木，将如图所示的两块积木摆放在桌面上，再从下列四块积木中选择一块，能搭成一个长、宽、高分别为"
   },
   {
    "t": "text",
    "v": "3"
   },
   {
    "t": "text",
    "v": "、"
   },
   {
    "t": "text",
    "v": "2"
   },
   {
    "t": "text",
    "v": "、"
   },
   {
    "t": "text",
    "v": "3"
   },
   {
    "t": "text",
    "v": "的长方体的是（    ）"
   },
   {
    "t": "break"
   },
   {
    "t": "img",
    "rid": "rId76",
    "src": "media/image38.png",
    "kind": "figure"
   }
  ],
  "rawParas": [
   "8. 用6个棱长为1的小正方体可以粘合形成不同形状的积木，将如图所示的两块积木摆放在桌面上，再从下列四块积木中选择一块，能搭成一个长、宽、高分别为3、2、3的长方体的是（    ）",
   "⟨公式⟩",
   "A. ⟨公式⟩B. ⟨公式⟩C. ⟨公式⟩D. ⟨公式⟩"
  ],
  "options": [
   "⟨公式⟩",
   "⟨公式⟩",
   "⟨公式⟩",
   "⟨公式⟩"
  ],
  "optionParts": [
   [
    {
     "t": "img",
     "rid": "rId77",
     "src": "media/image39.png",
     "kind": "figure"
    }
   ],
   [
    {
     "t": "img",
     "rid": "rId78",
     "src": "media/image40.png",
     "kind": "figure"
    }
   ],
   [
    {
     "t": "img",
     "rid": "rId79",
     "src": "media/image41.png",
     "kind": "figure"
    }
   ],
   [
    {
     "t": "img",
     "rid": "rId80",
     "src": "media/image42.png",
     "kind": "figure"
    }
   ]
  ],
  "key": 3,
  "answer": "⟨公式⟩",
  "officialKey": "D"
 },
 {
  "id": "p2021-q9",
  "paperId": "p2021",
  "year": "2021—2022",
  "no": 9,
  "qtype": "calc",
  "chapter": "ch-geo",
  "cat": "计算",
  "score": 2,
  "diff": "easy",
  "topic": "角度换算（度分秒）",
  "name": "角度换算（度分秒）",
  "bonus": false,
  "hasAnswer": true,
  "stemText": "⟨公式⟩＝___°．",
  "stemParts": [
   {
    "t": "text",
    "v": ""
   },
   {
    "t": "img",
    "rid": "rId81",
    "src": "media/image43.png",
    "kind": "formula"
   },
   {
    "t": "text",
    "v": "＝"
   },
   {
    "t": "text",
    "v": "___"
   },
   {
    "t": "text",
    "v": "°"
   },
   {
    "t": "text",
    "v": "．"
   }
  ],
  "rawParas": [
   "9. ⟨公式⟩＝___°．"
  ],
  "options": null,
  "optionParts": null,
  "key": null,
  "answer": "38.5",
  "accept": [
   "38.5"
  ],
  "officialKey": "38.5"
 },
 {
  "id": "p2021-q10",
  "paperId": "p2021",
  "year": "2021—2022",
  "no": 10,
  "qtype": "calc",
  "chapter": "ch-op",
  "cat": "概念",
  "score": 2,
  "diff": "easy",
  "topic": "近似数与精确度",
  "name": "四舍五入近似数",
  "bonus": false,
  "hasAnswer": true,
  "stemText": "用四舍五入法把3.786精确到0.01，所得到的近似数为___．",
  "stemParts": [
   {
    "t": "text",
    "v": ""
   },
   {
    "t": "text",
    "v": "用四舍五入法把"
   },
   {
    "t": "text",
    "v": "3.786"
   },
   {
    "t": "text",
    "v": "精确到"
   },
   {
    "t": "text",
    "v": "0.01"
   },
   {
    "t": "text",
    "v": "，所得到的近似数为"
   },
   {
    "t": "text",
    "v": "___"
   },
   {
    "t": "text",
    "v": "．"
   }
  ],
  "rawParas": [
   "10. 用四舍五入法把3.786精确到0.01，所得到的近似数为___．"
  ],
  "options": null,
  "optionParts": null,
  "key": null,
  "answer": "3.79",
  "accept": [
   "3.79"
  ],
  "officialKey": "3.79"
 },
 {
  "id": "p2021-q11",
  "paperId": "p2021",
  "year": "2021—2022",
  "no": 11,
  "qtype": "big",
  "chapter": "ch-poly",
  "cat": "概念",
  "score": 2,
  "diff": "easy",
  "topic": "同类项概念",
  "name": "同类项求参数",
  "bonus": false,
  "hasAnswer": true,
  "stemText": "如果单项式⟨公式⟩与⟨公式⟩是同类项，那么a＝___，b＝___．",
  "stemParts": [
   {
    "t": "text",
    "v": ""
   },
   {
    "t": "text",
    "v": "如果单项式"
   },
   {
    "t": "img",
    "rid": "rId83",
    "src": "media/image44.png",
    "kind": "formula"
   },
   {
    "t": "text",
    "v": "与"
   },
   {
    "t": "img",
    "rid": "rId85",
    "src": "media/image45.png",
    "kind": "formula"
   },
   {
    "t": "text",
    "v": "是同类项，那么"
   },
   {
    "t": "text",
    "v": "a"
   },
   {
    "t": "text",
    "v": "＝"
   },
   {
    "t": "text",
    "v": "___"
   },
   {
    "t": "text",
    "v": "，"
   },
   {
    "t": "text",
    "v": "b"
   },
   {
    "t": "text",
    "v": "＝"
   },
   {
    "t": "text",
    "v": "___"
   },
   {
    "t": "text",
    "v": "．"
   }
  ],
  "rawParas": [
   "11. 如果单项式⟨公式⟩与⟨公式⟩是同类项，那么a＝___，b＝___．"
  ],
  "options": null,
  "optionParts": null,
  "key": null,
  "answer": "①. 3    ②. 4",
  "officialKey": "①. 3    ②. 4"
 },
 {
  "id": "p2021-q12",
  "paperId": "p2021",
  "year": "2021—2022",
  "no": 12,
  "qtype": "calc",
  "chapter": "ch-expr",
  "cat": "计算",
  "score": 2,
  "diff": "mid",
  "topic": "代数式求值",
  "name": "代数式求值（整体）",
  "bonus": false,
  "hasAnswer": true,
  "stemText": "若⟨公式⟩，则⟨公式⟩的值为___．",
  "stemParts": [
   {
    "t": "text",
    "v": ""
   },
   {
    "t": "text",
    "v": "若"
   },
   {
    "t": "img",
    "rid": "rId87",
    "src": "media/image46.png",
    "kind": "formula"
   },
   {
    "t": "text",
    "v": "，则"
   },
   {
    "t": "img",
    "rid": "rId89",
    "src": "media/image47.png",
    "kind": "formula"
   },
   {
    "t": "text",
    "v": "的值为"
   },
   {
    "t": "text",
    "v": "___"
   },
   {
    "t": "text",
    "v": "．"
   }
  ],
  "rawParas": [
   "12. 若⟨公式⟩，则⟨公式⟩的值为___．"
  ],
  "options": null,
  "optionParts": null,
  "key": null,
  "answer": "0",
  "accept": [
   "0"
  ],
  "officialKey": "0"
 },
 {
  "id": "p2021-q13",
  "paperId": "p2021",
  "year": "2021—2022",
  "no": 13,
  "qtype": "calc",
  "chapter": "ch-eq",
  "cat": "概念",
  "score": 2,
  "diff": "easy",
  "topic": "方程解求参数",
  "name": "方程解求参数",
  "bonus": false,
  "hasAnswer": true,
  "stemText": "若⟨公式⟩是关于x的方程⟨公式⟩的解，则a＝___．",
  "stemParts": [
   {
    "t": "text",
    "v": ""
   },
   {
    "t": "text",
    "v": "若"
   },
   {
    "t": "img",
    "rid": "rId91",
    "src": "media/image48.png",
    "kind": "formula"
   },
   {
    "t": "text",
    "v": "是关于"
   },
   {
    "t": "text",
    "v": "x"
   },
   {
    "t": "text",
    "v": "的方程"
   },
   {
    "t": "img",
    "rid": "rId93",
    "src": "media/image49.png",
    "kind": "formula"
   },
   {
    "t": "text",
    "v": "的解，则"
   },
   {
    "t": "text",
    "v": "a"
   },
   {
    "t": "text",
    "v": "＝"
   },
   {
    "t": "text",
    "v": "___"
   },
   {
    "t": "text",
    "v": "．"
   }
  ],
  "rawParas": [
   "13. 若⟨公式⟩是关于x的方程⟨公式⟩的解，则a＝___．"
  ],
  "options": null,
  "optionParts": null,
  "key": null,
  "answer": "-2",
  "accept": [
   "-2"
  ],
  "officialKey": "-2"
 },
 {
  "id": "p2021-q14",
  "paperId": "p2021",
  "year": "2021—2022",
  "no": 14,
  "qtype": "big",
  "chapter": "ch-rational",
  "cat": "概念",
  "score": 2,
  "diff": "mid",
  "topic": "数轴读符号",
  "name": "数轴判断符号",
  "bonus": false,
  "hasAnswer": true,
  "stemText": "有理数a，b在数轴上的对应点的位置如图所示，有以下结论：①⟨公式⟩；②⟨公式⟩：③⟨公式⟩；④⟨公式⟩其中所有正确的结论是___（只填写序号）．⟨公式⟩⟨公式⟩",
  "stemParts": [
   {
    "t": "text",
    "v": ""
   },
   {
    "t": "text",
    "v": "有理数"
   },
   {
    "t": "text",
    "v": "a"
   },
   {
    "t": "text",
    "v": "，"
   },
   {
    "t": "text",
    "v": "b"
   },
   {
    "t": "text",
    "v": "在数轴上的对应点的位置如图所示，有以下结论：①"
   },
   {
    "t": "img",
    "rid": "rId95",
    "src": "media/image50.png",
    "kind": "formula"
   },
   {
    "t": "text",
    "v": "；②"
   },
   {
    "t": "img",
    "rid": "rId97",
    "src": "media/image51.png",
    "kind": "formula"
   },
   {
    "t": "text",
    "v": "：③"
   },
   {
    "t": "img",
    "rid": "rId99",
    "src": "media/image52.png",
    "kind": "formula"
   },
   {
    "t": "text",
    "v": "；④"
   },
   {
    "t": "img",
    "rid": "rId101",
    "src": "media/image53.png",
    "kind": "formula"
   },
   {
    "t": "text",
    "v": "其中所有正确的结论是"
   },
   {
    "t": "text",
    "v": "___"
   },
   {
    "t": "text",
    "v": "（只填写序号）．"
   },
   {
    "t": "break"
   },
   {
    "t": "img",
    "rid": "rId103",
    "src": "media/image54.png",
    "kind": "figure"
   }
  ],
  "rawParas": [
   "14. 有理数a，b在数轴上的对应点的位置如图所示，有以下结论：①⟨公式⟩；②⟨公式⟩：③⟨公式⟩；④⟨公式⟩其中所有正确的结论是___（只填写序号）．",
   "⟨公式⟩"
  ],
  "options": null,
  "optionParts": null,
  "key": null,
  "answer": null,
  "officialKey": "①④"
 },
 {
  "id": "p2021-q15",
  "paperId": "p2021",
  "year": "2021—2022",
  "no": 15,
  "qtype": "calc",
  "chapter": "ch-geo",
  "cat": "分类",
  "score": 2,
  "diff": "hard",
  "topic": "线段中点计算",
  "name": "线段中点 + 分类",
  "bonus": false,
  "hasAnswer": true,
  "stemText": "线段⟨公式⟩，C为线段AB的中点，点D在直线AB上，若⟨公式⟩，则CD＝___．",
  "stemParts": [
   {
    "t": "text",
    "v": ""
   },
   {
    "t": "text",
    "v": "线段"
   },
   {
    "t": "img",
    "rid": "rId104",
    "src": "media/image55.png",
    "kind": "formula"
   },
   {
    "t": "text",
    "v": "，"
   },
   {
    "t": "text",
    "v": "C"
   },
   {
    "t": "text",
    "v": "为线段"
   },
   {
    "t": "text",
    "v": "AB"
   },
   {
    "t": "text",
    "v": "的中点，点"
   },
   {
    "t": "text",
    "v": "D"
   },
   {
    "t": "text",
    "v": "在直线"
   },
   {
    "t": "text",
    "v": "AB"
   },
   {
    "t": "text",
    "v": "上，若"
   },
   {
    "t": "img",
    "rid": "rId106",
    "src": "media/image56.png",
    "kind": "formula"
   },
   {
    "t": "text",
    "v": "，则"
   },
   {
    "t": "text",
    "v": "CD"
   },
   {
    "t": "text",
    "v": "＝"
   },
   {
    "t": "text",
    "v": "___"
   },
   {
    "t": "text",
    "v": "．"
   }
  ],
  "rawParas": [
   "15. 线段⟨公式⟩，C为线段AB的中点，点D在直线AB上，若⟨公式⟩，则CD＝___．"
  ],
  "options": null,
  "optionParts": null,
  "key": null,
  "answer": "6或12##12或6",
  "accept": [
   "6或12##12或6"
  ],
  "officialKey": "6或12##12或6"
 },
 {
  "id": "p2021-q16",
  "paperId": "p2021",
  "year": "2021—2022",
  "no": 16,
  "qtype": "big",
  "chapter": "ch-op",
  "cat": "推理",
  "score": 2,
  "diff": "hard",
  "topic": "数字填图（幻方类）",
  "name": "幻圆（数字和相等）",
  "bonus": false,
  "hasAnswer": false,
  "stemText": "在如图所示的星形图案中，十个“圆圈”中的数字分别是1，2，3，4，5，6，8，9，10，12，并且每条“直线”上的四个数字之和都相等．请将图中的数字补全______．⟨公式⟩⟨公式⟩⟨公式⟩三、解答题（共68分，第17题18分，第⟨公式⟩题，每题6分，第20题11分，第21题7分，第22题8分，第⟨公式⟩题，每题6分）",
  "stemParts": [
   {
    "t": "text",
    "v": ""
   },
   {
    "t": "text",
    "v": "在如图所示的星形图案中，十个“圆圈”中的数字分别是"
   },
   {
    "t": "text",
    "v": "1"
   },
   {
    "t": "text",
    "v": "，"
   },
   {
    "t": "text",
    "v": "2"
   },
   {
    "t": "text",
    "v": "，"
   },
   {
    "t": "text",
    "v": "3"
   },
   {
    "t": "text",
    "v": "，"
   },
   {
    "t": "text",
    "v": "4"
   },
   {
    "t": "text",
    "v": "，"
   },
   {
    "t": "text",
    "v": "5"
   },
   {
    "t": "text",
    "v": "，"
   },
   {
    "t": "text",
    "v": "6"
   },
   {
    "t": "text",
    "v": "，"
   },
   {
    "t": "text",
    "v": "8"
   },
   {
    "t": "text",
    "v": "，"
   },
   {
    "t": "text",
    "v": "9"
   },
   {
    "t": "text",
    "v": "，"
   },
   {
    "t": "text",
    "v": "10"
   },
   {
    "t": "text",
    "v": "，"
   },
   {
    "t": "text",
    "v": "12"
   },
   {
    "t": "text",
    "v": "，并且每条“直线”上的四个数字之和都相等．请将图中的数字补全"
   },
   {
    "t": "text",
    "v": "______"
   },
   {
    "t": "text",
    "v": "．"
   },
   {
    "t": "break"
   },
   {
    "t": "img",
    "rid": "rId108",
    "src": "media/image57.png",
    "kind": "figure"
   },
   {
    "t": "break"
   },
   {
    "t": "text",
    "v": "三、解答题（共"
   },
   {
    "t": "text",
    "v": "68"
   },
   {
    "t": "text",
    "v": "分，第"
   },
   {
    "t": "text",
    "v": "17"
   },
   {
    "t": "text",
    "v": "题"
   },
   {
    "t": "text",
    "v": "18"
   },
   {
    "t": "text",
    "v": "分，第"
   },
   {
    "t": "img",
    "rid": "rId109",
    "src": "media/image58.png",
    "kind": "formula"
   },
   {
    "t": "text",
    "v": "题，每题"
   },
   {
    "t": "text",
    "v": "6"
   },
   {
    "t": "text",
    "v": "分，第"
   },
   {
    "t": "text",
    "v": "20"
   },
   {
    "t": "text",
    "v": "题"
   },
   {
    "t": "text",
    "v": "11"
   },
   {
    "t": "text",
    "v": "分，第"
   },
   {
    "t": "text",
    "v": "21"
   },
   {
    "t": "text",
    "v": "题"
   },
   {
    "t": "text",
    "v": "7"
   },
   {
    "t": "text",
    "v": "分，第"
   },
   {
    "t": "text",
    "v": "22"
   },
   {
    "t": "text",
    "v": "题"
   },
   {
    "t": "text",
    "v": "8"
   },
   {
    "t": "text",
    "v": "分，第"
   },
   {
    "t": "img",
    "rid": "rId111",
    "src": "media/image59.png",
    "kind": "formula"
   },
   {
    "t": "text",
    "v": "题，每题"
   },
   {
    "t": "text",
    "v": "6"
   },
   {
    "t": "text",
    "v": "分）"
   }
  ],
  "rawParas": [
   "16. 在如图所示的星形图案中，十个“圆圈”中的数字分别是1，2，3，4，5，6，8，9，10，12，并且每条“直线”上的四个数字之和都相等．请将图中的数字补全______．",
   "⟨公式⟩",
   "三、解答题（共68分，第17题18分，第⟨公式⟩题，每题6分，第20题11分，第21题7分，第22题8分，第⟨公式⟩题，每题6分）"
  ],
  "options": null,
  "optionParts": null,
  "key": null,
  "answer": null,
  "officialKey": null
 },
 {
  "id": "p2021-q17",
  "paperId": "p2021",
  "year": "2021—2022",
  "no": 17,
  "qtype": "big",
  "chapter": "ch-op",
  "cat": "计算",
  "score": 18,
  "diff": "mid",
  "topic": "有理数混合运算",
  "name": "有理数混合计算（4 小问）",
  "bonus": false,
  "hasAnswer": true,
  "stemText": "计算：⟨公式⟩（1）⟨公式⟩；⟨公式⟩（2）⟨公式⟩⟨公式⟩（3）⟨公式⟩⟨公式⟩（4）⟨公式⟩",
  "stemParts": [
   {
    "t": "text",
    "v": ""
   },
   {
    "t": "text",
    "v": "计算："
   },
   {
    "t": "break"
   },
   {
    "t": "text",
    "v": "（"
   },
   {
    "t": "text",
    "v": "1"
   },
   {
    "t": "text",
    "v": "）"
   },
   {
    "t": "img",
    "rid": "rId113",
    "src": "media/image60.png",
    "kind": "formula"
   },
   {
    "t": "text",
    "v": "；"
   },
   {
    "t": "break"
   },
   {
    "t": "text",
    "v": "（"
   },
   {
    "t": "text",
    "v": "2"
   },
   {
    "t": "text",
    "v": "）"
   },
   {
    "t": "img",
    "rid": "rId115",
    "src": "media/image61.png",
    "kind": "formula"
   },
   {
    "t": "break"
   },
   {
    "t": "text",
    "v": "（"
   },
   {
    "t": "text",
    "v": "3"
   },
   {
    "t": "text",
    "v": "）"
   },
   {
    "t": "img",
    "rid": "rId117",
    "src": "media/image62.png",
    "kind": "formula"
   },
   {
    "t": "break"
   },
   {
    "t": "text",
    "v": "（4）"
   },
   {
    "t": "img",
    "rid": "rId119",
    "src": "media/image63.png",
    "kind": "formula"
   }
  ],
  "rawParas": [
   "17. 计算：",
   "（1）⟨公式⟩；",
   "（2）⟨公式⟩",
   "（3）⟨公式⟩",
   "（4）⟨公式⟩"
  ],
  "options": null,
  "optionParts": null,
  "key": null,
  "answer": null,
  "officialKey": "（1）；（2）；（3）；（4）"
 },
 {
  "id": "p2021-q18",
  "paperId": "p2021",
  "year": "2021—2022",
  "no": 18,
  "qtype": "big",
  "chapter": "ch-poly",
  "cat": "计算",
  "score": 6,
  "diff": "mid",
  "topic": "整式化简求值",
  "name": "整式化简求值",
  "bonus": false,
  "hasAnswer": true,
  "stemText": "先化简，再求值： ⟨公式⟩其中⟨公式⟩，⟨公式⟩．",
  "stemParts": [
   {
    "t": "text",
    "v": ""
   },
   {
    "t": "text",
    "v": "先化简，再求值："
   },
   {
    "t": "text",
    "v": " "
   },
   {
    "t": "img",
    "rid": "rId121",
    "src": "media/image64.png",
    "kind": "formula"
   },
   {
    "t": "text",
    "v": "其中"
   },
   {
    "t": "img",
    "rid": "rId123",
    "src": "media/image65.png",
    "kind": "formula"
   },
   {
    "t": "text",
    "v": "，"
   },
   {
    "t": "img",
    "rid": "rId125",
    "src": "media/image66.png",
    "kind": "formula"
   },
   {
    "t": "text",
    "v": "．"
   }
  ],
  "rawParas": [
   "18. 先化简，再求值： ⟨公式⟩其中⟨公式⟩，⟨公式⟩．"
  ],
  "options": null,
  "optionParts": null,
  "key": null,
  "answer": null,
  "officialKey": "，"
 },
 {
  "id": "p2021-q19",
  "paperId": "p2021",
  "year": "2021—2022",
  "no": 19,
  "qtype": "big",
  "chapter": "ch-geo",
  "cat": "作图",
  "score": 6,
  "diff": "mid",
  "topic": "方位角与作图",
  "name": "方位角作图 + 三边关系",
  "bonus": false,
  "hasAnswer": false,
  "stemText": "平面上有三个点A，B，O．点A在点O的北偏东⟨公式⟩方向上，⟨公式⟩，点B在点O的南偏东30°方向上，⟨公式⟩，连接AB，点C为线段AB的中点，连接OC．⟨公式⟩（1）依题意补全图形（借助量角器、刻度尺画图）；⟨公式⟩（2）写出⟨公式⟩的依据：⟨公式⟩（3）比较线段OC与AC的长短并说明理由：⟨公式⟩（4）直接写出∠AOB的度数．",
  "stemParts": [
   {
    "t": "text",
    "v": ""
   },
   {
    "t": "text",
    "v": "平面上有三个点"
   },
   {
    "t": "text",
    "v": "A"
   },
   {
    "t": "text",
    "v": "，"
   },
   {
    "t": "text",
    "v": "B"
   },
   {
    "t": "text",
    "v": "，"
   },
   {
    "t": "text",
    "v": "O"
   },
   {
    "t": "text",
    "v": "．点"
   },
   {
    "t": "text",
    "v": "A"
   },
   {
    "t": "text",
    "v": "在点"
   },
   {
    "t": "text",
    "v": "O"
   },
   {
    "t": "text",
    "v": "的北偏东"
   },
   {
    "t": "img",
    "rid": "rId127",
    "src": "media/image67.png",
    "kind": "formula"
   },
   {
    "t": "text",
    "v": "方向上，"
   },
   {
    "t": "img",
    "rid": "rId129",
    "src": "media/image68.png",
    "kind": "formula"
   },
   {
    "t": "text",
    "v": "，点"
   },
   {
    "t": "text",
    "v": "B"
   },
   {
    "t": "text",
    "v": "在点"
   },
   {
    "t": "text",
    "v": "O"
   },
   {
    "t": "text",
    "v": "的南偏东"
   },
   {
    "t": "text",
    "v": "30"
   },
   {
    "t": "text",
    "v": "°方向上，"
   },
   {
    "t": "img",
    "rid": "rId131",
    "src": "media/image69.png",
    "kind": "formula"
   },
   {
    "t": "text",
    "v": "，连接"
   },
   {
    "t": "text",
    "v": "AB"
   },
   {
    "t": "text",
    "v": "，点"
   },
   {
    "t": "text",
    "v": "C"
   },
   {
    "t": "text",
    "v": "为线段"
   },
   {
    "t": "text",
    "v": "AB"
   },
   {
    "t": "text",
    "v": "的中点，连接"
   },
   {
    "t": "text",
    "v": "OC"
   },
   {
    "t": "text",
    "v": "．"
   },
   {
    "t": "break"
   },
   {
    "t": "text",
    "v": "（"
   },
   {
    "t": "text",
    "v": "1"
   },
   {
    "t": "text",
    "v": "）依题意补全图形（借助量角器、刻度尺画图）；"
   },
   {
    "t": "break"
   },
   {
    "t": "text",
    "v": "（"
   },
   {
    "t": "text",
    "v": "2"
   },
   {
    "t": "text",
    "v": "）写出"
   },
   {
    "t": "img",
    "rid": "rId133",
    "src": "media/image70.png",
    "kind": "formula"
   },
   {
    "t": "text",
    "v": "的依据："
   },
   {
    "t": "break"
   },
   {
    "t": "text",
    "v": "（"
   },
   {
    "t": "text",
    "v": "3"
   },
   {
    "t": "text",
    "v": "）比较线段"
   },
   {
    "t": "text",
    "v": "OC"
   },
   {
    "t": "text",
    "v": "与"
   },
   {
    "t": "text",
    "v": "AC"
   },
   {
    "t": "text",
    "v": "的长短并说明理由："
   },
   {
    "t": "break"
   },
   {
    "t": "text",
    "v": "（"
   },
   {
    "t": "text",
    "v": "4"
   },
   {
    "t": "text",
    "v": "）直接写出∠"
   },
   {
    "t": "text",
    "v": "AOB"
   },
   {
    "t": "text",
    "v": "的度数．"
   }
  ],
  "rawParas": [
   "19. 平面上有三个点A，B，O．点A在点O的北偏东⟨公式⟩方向上，⟨公式⟩，点B在点O的南偏东30°方向上，⟨公式⟩，连接AB，点C为线段AB的中点，连接OC．",
   "（1）依题意补全图形（借助量角器、刻度尺画图）；",
   "（2）写出⟨公式⟩的依据：",
   "（3）比较线段OC与AC的长短并说明理由：",
   "（4）直接写出∠AOB的度数．"
  ],
  "options": null,
  "optionParts": null,
  "key": null,
  "answer": null,
  "officialKey": null
 },
 {
  "id": "p2021-q20",
  "paperId": "p2021",
  "year": "2021—2022",
  "no": 20,
  "qtype": "big",
  "chapter": "ch-eq",
  "cat": "计算",
  "score": 11,
  "diff": "mid",
  "topic": "解一元一次方程",
  "name": "解方程（2 小问，含去分母）",
  "bonus": false,
  "hasAnswer": true,
  "stemText": "解下列方程：⟨公式⟩（1）⟨公式⟩； ⟨公式⟩（2）⟨公式⟩",
  "stemParts": [
   {
    "t": "text",
    "v": ""
   },
   {
    "t": "text",
    "v": "解下列方程："
   },
   {
    "t": "break"
   },
   {
    "t": "text",
    "v": "（"
   },
   {
    "t": "text",
    "v": "1"
   },
   {
    "t": "text",
    "v": "）"
   },
   {
    "t": "img",
    "rid": "rId135",
    "src": "media/image71.png",
    "kind": "formula"
   },
   {
    "t": "text",
    "v": "；"
   },
   {
    "t": "text",
    "v": " "
   },
   {
    "t": "break"
   },
   {
    "t": "text",
    "v": "（"
   },
   {
    "t": "text",
    "v": "2"
   },
   {
    "t": "text",
    "v": "）"
   },
   {
    "t": "img",
    "rid": "rId137",
    "src": "media/image72.png",
    "kind": "formula"
   }
  ],
  "rawParas": [
   "20. 解下列方程：",
   "（1）⟨公式⟩；",
   "（2）⟨公式⟩"
  ],
  "options": null,
  "optionParts": null,
  "key": null,
  "answer": null,
  "officialKey": "（1）；（2）"
 },
 {
  "id": "p2021-q21",
  "paperId": "p2021",
  "year": "2021—2022",
  "no": 21,
  "qtype": "big",
  "chapter": "ch-geo",
  "cat": "推理",
  "score": 7,
  "diff": "mid",
  "topic": "角度推理与说理",
  "name": "角度推理填空（同角余角）",
  "bonus": false,
  "hasAnswer": true,
  "stemText": "如图，⟨公式⟩．⟨公式⟩，OA平分∠COE，⟨公式⟩⟨公式⟩．⟨公式⟩（1）求∠DOE的度数（用含n的代数式表示）：请将以下解答过程补充完整．⟨公式⟩⟨公式⟩⟨公式⟩解：∵⟨公式⟩，⟨公式⟩∴⟨公式⟩．⟨公式⟩∵⟨公式⟩．⟨公式⟩⟨公式⟩．⟨公式⟩∴⟨公式⟩        ．（理由：        ）⟨公式⟩∵⟨公式⟩，⟨公式⟩∴⟨公式⟩．⟨公式⟩∵OA平分∠COE，⟨公式⟩∴∠       ＝⟨公式⟩．（理由：        ）⟨公式⟩∴⟨公式⟩___＝        °．⟨公式⟩（2）用等式表示∠AOD与∠BOC的数量关系．",
  "stemParts": [
   {
    "t": "text",
    "v": ""
   },
   {
    "t": "text",
    "v": "如图，"
   },
   {
    "t": "img",
    "rid": "rId139",
    "src": "media/image73.png",
    "kind": "formula"
   },
   {
    "t": "text",
    "v": "．"
   },
   {
    "t": "img",
    "rid": "rId141",
    "src": "media/image74.png",
    "kind": "formula"
   },
   {
    "t": "text",
    "v": "，"
   },
   {
    "t": "text",
    "v": "OA"
   },
   {
    "t": "text",
    "v": "平分∠"
   },
   {
    "t": "text",
    "v": "COE"
   },
   {
    "t": "text",
    "v": "，"
   },
   {
    "t": "img",
    "rid": "rId143",
    "src": "media/image75.png",
    "kind": "formula"
   },
   {
    "t": "img",
    "rid": "rId145",
    "src": "media/image76.png",
    "kind": "formula"
   },
   {
    "t": "text",
    "v": "．"
   },
   {
    "t": "break"
   },
   {
    "t": "text",
    "v": "（"
   },
   {
    "t": "text",
    "v": "1"
   },
   {
    "t": "text",
    "v": "）求∠"
   },
   {
    "t": "text",
    "v": "DOE"
   },
   {
    "t": "text",
    "v": "的度数（用含"
   },
   {
    "t": "text",
    "v": "n"
   },
   {
    "t": "text",
    "v": "的代数式表示）：请将以下解答过程补充完整．"
   },
   {
    "t": "break"
   },
   {
    "t": "img",
    "rid": "rId147",
    "src": "media/image77.png",
    "kind": "figure"
   },
   {
    "t": "break"
   },
   {
    "t": "text",
    "v": "解：∵"
   },
   {
    "t": "img",
    "rid": "rId148",
    "src": "media/image78.png",
    "kind": "formula"
   },
   {
    "t": "text",
    "v": "，"
   },
   {
    "t": "break"
   },
   {
    "t": "text",
    "v": "∴"
   },
   {
    "t": "img",
    "rid": "rId150",
    "src": "media/image79.png",
    "kind": "formula"
   },
   {
    "t": "text",
    "v": "．"
   },
   {
    "t": "break"
   },
   {
    "t": "text",
    "v": "∵"
   },
   {
    "t": "img",
    "rid": "rId152",
    "src": "media/image80.png",
    "kind": "formula"
   },
   {
    "t": "text",
    "v": "．"
   },
   {
    "t": "break"
   },
   {
    "t": "img",
    "rid": "rId154",
    "src": "media/image81.png",
    "kind": "formula"
   },
   {
    "t": "text",
    "v": "．"
   },
   {
    "t": "break"
   },
   {
    "t": "text",
    "v": "∴"
   },
   {
    "t": "img",
    "rid": "rId156",
    "src": "media/image82.png",
    "kind": "formula"
   },
   {
    "t": "text",
    "v": "        "
   },
   {
    "t": "text",
    "v": "．（理由："
   },
   {
    "t": "text",
    "v": "        "
   },
   {
    "t": "text",
    "v": "）"
   },
   {
    "t": "break"
   },
   {
    "t": "text",
    "v": "∵"
   },
   {
    "t": "img",
    "rid": "rId143",
    "src": "media/image75.png",
    "kind": "formula"
   },
   {
    "t": "text",
    "v": "，"
   },
   {
    "t": "break"
   },
   {
    "t": "text",
    "v": "∴"
   },
   {
    "t": "img",
    "rid": "rId159",
    "src": "media/image83.png",
    "kind": "formula"
   },
   {
    "t": "text",
    "v": "．"
   },
   {
    "t": "break"
   },
   {
    "t": "text",
    "v": "∵"
   },
   {
    "t": "text",
    "v": "OA"
   },
   {
    "t": "text",
    "v": "平分∠"
   },
   {
    "t": "text",
    "v": "COE"
   },
   {
    "t": "text",
    "v": "，"
   },
   {
    "t": "break"
   },
   {
    "t": "text",
    "v": "∴∠"
   },
   {
    "t": "text",
    "v": "       "
   },
   {
    "t": "text",
    "v": "＝"
   },
   {
    "t": "img",
    "rid": "rId161",
    "src": "media/image84.png",
    "kind": "formula"
   },
   {
    "t": "text",
    "v": "．（理由："
   },
   {
    "t": "text",
    "v": "        "
   },
   {
    "t": "text",
    "v": "）"
   },
   {
    "t": "break"
   },
   {
    "t": "text",
    "v": "∴"
   },
   {
    "t": "img",
    "rid": "rId163",
    "src": "media/image85.png",
    "kind": "formula"
   },
   {
    "t": "text",
    "v": "___＝"
   },
   {
    "t": "text",
    "v": "        "
   },
   {
    "t": "text",
    "v": "°．"
   },
   {
    "t": "break"
   },
   {
    "t": "text",
    "v": "（"
   },
   {
    "t": "text",
    "v": "2"
   },
   {
    "t": "text",
    "v": "）用等式表示∠"
   },
   {
    "t": "text",
    "v": "AOD"
   },
   {
    "t": "text",
    "v": "与∠"
   },
   {
    "t": "text",
    "v": "BOC"
   },
   {
    "t": "text",
    "v": "的数量关系．"
   }
  ],
  "rawParas": [
   "21. 如图，⟨公式⟩．⟨公式⟩，OA平分∠COE，⟨公式⟩⟨公式⟩．",
   "（1）求∠DOE的度数（用含n的代数式表示）：请将以下解答过程补充完整．",
   "⟨公式⟩",
   "解：∵⟨公式⟩，",
   "∴⟨公式⟩．",
   "∵⟨公式⟩．",
   "⟨公式⟩．",
   "∴⟨公式⟩        ．（理由：        ）",
   "∵⟨公式⟩，",
   "∴⟨公式⟩．",
   "∵OA平分∠COE，",
   "∴∠       ＝⟨公式⟩．（理由：        ）",
   "∴⟨公式⟩___＝        °．",
   "（2）用等式表示∠AOD与∠BOC的数量关系．"
  ],
  "options": null,
  "optionParts": null,
  "key": null,
  "answer": "（1）；同角的余角相等；；角平分线的定义；，；（2）",
  "officialKey": "（1）；同角的余角相等；；角平分线的定义；，；（2）"
 },
 {
  "id": "p2021-q22",
  "paperId": "p2021",
  "year": "2021—2022",
  "no": 22,
  "qtype": "big",
  "chapter": "ch-eq",
  "cat": "建模",
  "score": 8,
  "diff": "mid",
  "topic": "方程应用（配套/分配）",
  "name": "方程应用题（中国结）",
  "bonus": false,
  "hasAnswer": true,
  "stemText": "某班手工兴趣小组的同学们计划制作一批中国结送给敬老院作为新年礼物．如果每人制作9个，那么就比计划少做17个；如果每人制作12个，那么就比计划多做4个．⟨公式⟩（1）这个手工兴趣小组共有多少人？计划要做的这批中国结有多少个？⟨公式⟩（2）同学们打算用A，B两种不同的编结方式来制作这一批中国结，已知每个A型中国结需用红绳0.6米，每个B型中国结需用红绳0.9米，现有50米红绳，制作这批中国结能恰好用完这50米红绳吗？请说明你的理由．",
  "stemParts": [
   {
    "t": "text",
    "v": ""
   },
   {
    "t": "text",
    "v": "某班手工兴趣小组的同学们计划制作一批中国结送给敬老院作为新年礼物．如果每人制作"
   },
   {
    "t": "text",
    "v": "9"
   },
   {
    "t": "text",
    "v": "个，那么就比计划少做"
   },
   {
    "t": "text",
    "v": "17"
   },
   {
    "t": "text",
    "v": "个；如果每人制作"
   },
   {
    "t": "text",
    "v": "12"
   },
   {
    "t": "text",
    "v": "个，那么就比计划多做"
   },
   {
    "t": "text",
    "v": "4"
   },
   {
    "t": "text",
    "v": "个．"
   },
   {
    "t": "break"
   },
   {
    "t": "text",
    "v": "（"
   },
   {
    "t": "text",
    "v": "1"
   },
   {
    "t": "text",
    "v": "）这个手工兴趣小组共有多少人？计划要做的这批中国结有多少个？"
   },
   {
    "t": "break"
   },
   {
    "t": "text",
    "v": "（"
   },
   {
    "t": "text",
    "v": "2"
   },
   {
    "t": "text",
    "v": "）同学们打算用"
   },
   {
    "t": "text",
    "v": "A"
   },
   {
    "t": "text",
    "v": "，"
   },
   {
    "t": "text",
    "v": "B"
   },
   {
    "t": "text",
    "v": "两种不同的编结方式来制作这一批中国结，已知每个"
   },
   {
    "t": "text",
    "v": "A"
   },
   {
    "t": "text",
    "v": "型中国结需用红绳"
   },
   {
    "t": "text",
    "v": "0.6"
   },
   {
    "t": "text",
    "v": "米，每个"
   },
   {
    "t": "text",
    "v": "B"
   },
   {
    "t": "text",
    "v": "型中国结需用红绳"
   },
   {
    "t": "text",
    "v": "0.9"
   },
   {
    "t": "text",
    "v": "米，现有"
   },
   {
    "t": "text",
    "v": "50"
   },
   {
    "t": "text",
    "v": "米红绳，制作这批中国结能恰好用完这"
   },
   {
    "t": "text",
    "v": "50"
   },
   {
    "t": "text",
    "v": "米红绳吗？请说明你的理由．"
   }
  ],
  "rawParas": [
   "22. 某班手工兴趣小组的同学们计划制作一批中国结送给敬老院作为新年礼物．如果每人制作9个，那么就比计划少做17个；如果每人制作12个，那么就比计划多做4个．",
   "（1）这个手工兴趣小组共有多少人？计划要做的这批中国结有多少个？",
   "（2）同学们打算用A，B两种不同的编结方式来制作这一批中国结，已知每个A型中国结需用红绳0.6米，每个B型中国结需用红绳0.9米，现有50米红绳，制作这批中国结能恰好用完这50米红绳吗？请说明你的理由．"
  ],
  "options": null,
  "optionParts": null,
  "key": null,
  "answer": "（1）这个手工兴趣小组共有7人，计划要做的这批中国结有80个；",
  "officialKey": "（1）这个手工兴趣小组共有7人，计划要做的这批中国结有80个；"
 },
 {
  "id": "p2021-q23",
  "paperId": "p2021",
  "year": "2021—2022",
  "no": 23,
  "qtype": "big",
  "chapter": "ch-rational",
  "cat": "分类",
  "score": 6,
  "diff": "hard",
  "topic": "数轴动点与分类",
  "name": "数轴点距离 + 分类",
  "bonus": false,
  "hasAnswer": true,
  "stemText": "在数轴上有A，B，C，M四点，点A表示的数是－1，点B表示的数是6，点M位于点B的左侧并与点B的距离是5，M为线段AC的中点．⟨公式⟩⟨公式⟩⟨公式⟩（1）画出点M，点C，并直接写出点M，点C表示的数；⟨公式⟩（2）画出在数轴上与点B的距离小于或等于5的点组成的图形，并描述该图形的特征；⟨公式⟩（3）若数轴上的点Q满足⟨公式⟩，求点Q表示的数．",
  "stemParts": [
   {
    "t": "text",
    "v": ""
   },
   {
    "t": "text",
    "v": "在数轴上有"
   },
   {
    "t": "text",
    "v": "A"
   },
   {
    "t": "text",
    "v": "，"
   },
   {
    "t": "text",
    "v": "B"
   },
   {
    "t": "text",
    "v": "，"
   },
   {
    "t": "text",
    "v": "C"
   },
   {
    "t": "text",
    "v": "，"
   },
   {
    "t": "text",
    "v": "M"
   },
   {
    "t": "text",
    "v": "四点，点"
   },
   {
    "t": "text",
    "v": "A"
   },
   {
    "t": "text",
    "v": "表示的数是－"
   },
   {
    "t": "text",
    "v": "1"
   },
   {
    "t": "text",
    "v": "，点"
   },
   {
    "t": "text",
    "v": "B"
   },
   {
    "t": "text",
    "v": "表示的数是"
   },
   {
    "t": "text",
    "v": "6"
   },
   {
    "t": "text",
    "v": "，点"
   },
   {
    "t": "text",
    "v": "M"
   },
   {
    "t": "text",
    "v": "位于点"
   },
   {
    "t": "text",
    "v": "B"
   },
   {
    "t": "text",
    "v": "的左侧并与点"
   },
   {
    "t": "text",
    "v": "B"
   },
   {
    "t": "text",
    "v": "的距离是"
   },
   {
    "t": "text",
    "v": "5"
   },
   {
    "t": "text",
    "v": "，"
   },
   {
    "t": "text",
    "v": "M"
   },
   {
    "t": "text",
    "v": "为线段"
   },
   {
    "t": "text",
    "v": "AC"
   },
   {
    "t": "text",
    "v": "的中点．"
   },
   {
    "t": "break"
   },
   {
    "t": "img",
    "rid": "rId165",
    "src": "media/image86.png",
    "kind": "figure"
   },
   {
    "t": "break"
   },
   {
    "t": "text",
    "v": "（"
   },
   {
    "t": "text",
    "v": "1"
   },
   {
    "t": "text",
    "v": "）画出点"
   },
   {
    "t": "text",
    "v": "M"
   },
   {
    "t": "text",
    "v": "，点"
   },
   {
    "t": "text",
    "v": "C"
   },
   {
    "t": "text",
    "v": "，并直接写出点"
   },
   {
    "t": "text",
    "v": "M"
   },
   {
    "t": "text",
    "v": "，点"
   },
   {
    "t": "text",
    "v": "C"
   },
   {
    "t": "text",
    "v": "表示的数；"
   },
   {
    "t": "break"
   },
   {
    "t": "text",
    "v": "（"
   },
   {
    "t": "text",
    "v": "2"
   },
   {
    "t": "text",
    "v": "）画出在数轴上与点"
   },
   {
    "t": "text",
    "v": "B"
   },
   {
    "t": "text",
    "v": "的距离小于或等于"
   },
   {
    "t": "text",
    "v": "5"
   },
   {
    "t": "text",
    "v": "的点组成的图形，并描述该图形的特征；"
   },
   {
    "t": "break"
   },
   {
    "t": "text",
    "v": "（"
   },
   {
    "t": "text",
    "v": "3"
   },
   {
    "t": "text",
    "v": "）若数轴上的点"
   },
   {
    "t": "text",
    "v": "Q"
   },
   {
    "t": "text",
    "v": "满足"
   },
   {
    "t": "img",
    "rid": "rId166",
    "src": "media/image87.png",
    "kind": "formula"
   },
   {
    "t": "text",
    "v": "，求点"
   },
   {
    "t": "text",
    "v": "Q"
   },
   {
    "t": "text",
    "v": "表示的数．"
   }
  ],
  "rawParas": [
   "23. 在数轴上有A，B，C，M四点，点A表示的数是－1，点B表示的数是6，点M位于点B的左侧并与点B的距离是5，M为线段AC的中点．",
   "⟨公式⟩",
   "（1）画出点M，点C，并直接写出点M，点C表示的数；",
   "（2）画出在数轴上与点B的距离小于或等于5的点组成的图形，并描述该图形的特征；",
   "（3）若数轴上的点Q满足⟨公式⟩，求点Q表示的数．"
  ],
  "options": null,
  "optionParts": null,
  "key": null,
  "answer": null,
  "officialKey": "（1）M为1，C为3；图见解析；（2）图见解析，是长为10的线段CD；（3）Q表示"
 },
 {
  "id": "p2021-q24",
  "paperId": "p2021",
  "year": "2021—2022",
  "no": 24,
  "qtype": "big",
  "chapter": "ch-expr",
  "cat": "推理",
  "score": 6,
  "diff": "top",
  "topic": "阅读理解型",
  "name": "阅读理解（19 的倍数）",
  "bonus": false,
  "hasAnswer": true,
  "stemText": "【阅读与理解】小天同学看到如下的阅读材料：⟨公式⟩对于一个数A，以下给出了判断数A是否为19的倍数的一种方法：⟨公式⟩每次划掉该数的最后一位数字，将划掉这个数字的两倍与剩下的数相加得到一个和，称为一次操作，依此类推，直到数变为20以内的数为止．若最后得到的数为19.则最初的数A就是19的倍数，否则，数A就不是19的倍数． ⟨公式⟩以⟨公式⟩为例，经过第一次操作得到55，经过第二次操作得到15，⟨公式⟩，⟨公式⟩．所以436不是19的倍数．⟨公式⟩当数A的位数更多时，这种方法依然适用．⟨公式⟩⟨公式⟩⟨公式⟩【操作与说理】⟨公式⟩（1）当⟨公式⟩时，请你帮小天写出判断过程；⟨公式⟩（2）小天尝试说明方法的道理，他发现解决问题的关键是每次判断过程的第一次操作，后续的操作道理都与第一次相同，于是他列出了如下表格进行分析．请你补全小天列出的表格：⟨公式⟩说明：⟨公式⟩表示⟨公式⟩，其中⟨公式⟩，a，b，c均为整数．⟨公式⟩A⟨公式⟩A的表达式⟨公式⟩第一次操作得到的和，记为M（A）⟨公式⟩436⟨公式⟩436＝10×43＋6⟨公式⟩M（436）＝43＋2×6⟨公式⟩532⟨公式⟩532＝    ⟨公式⟩M（532）＝    ⟨公式⟩863⟨公式⟩863＝10×86＋3⟨公式⟩M（863）＝86＋2×3⟨公式⟩……⟨公式⟩……⟨公式⟩……⟨公式⟩⟨公式⟩⟨公式⟩⟨公式⟩＝    ⟨公式⟩M（⟨公式⟩）＝    ⟨公式⟩（3）利用以上信息说明：当M（⟨公式⟩）是19的倍数时，⟨公式⟩也是19的倍数．",
  "stemParts": [
   {
    "t": "text",
    "v": ""
   },
   {
    "t": "text",
    "v": "【阅读与理解】小天同学看到如下的阅读材料："
   },
   {
    "t": "break"
   },
   {
    "t": "text",
    "v": "对于一个数"
   },
   {
    "t": "text",
    "v": "A"
   },
   {
    "t": "text",
    "v": "，以下给出了判断数"
   },
   {
    "t": "text",
    "v": "A"
   },
   {
    "t": "text",
    "v": "是否为"
   },
   {
    "t": "text",
    "v": "19"
   },
   {
    "t": "text",
    "v": "的倍数的一种方法："
   },
   {
    "t": "break"
   },
   {
    "t": "text",
    "v": "每次划掉该数的最后一位数字，将划掉这个数字的两倍与剩下的数相加得到一个和，称为一次操作，依此类推，直到数变为"
   },
   {
    "t": "text",
    "v": "20"
   },
   {
    "t": "text",
    "v": "以内的数为止．若最后得到的数为"
   },
   {
    "t": "text",
    "v": "19."
   },
   {
    "t": "text",
    "v": "则最初的数"
   },
   {
    "t": "text",
    "v": "A"
   },
   {
    "t": "text",
    "v": "就是"
   },
   {
    "t": "text",
    "v": "19"
   },
   {
    "t": "text",
    "v": "的倍数，否则，数"
   },
   {
    "t": "text",
    "v": "A"
   },
   {
    "t": "text",
    "v": "就不是"
   },
   {
    "t": "text",
    "v": "19"
   },
   {
    "t": "text",
    "v": "的倍数．"
   },
   {
    "t": "text",
    "v": " "
   },
   {
    "t": "break"
   },
   {
    "t": "text",
    "v": "以"
   },
   {
    "t": "img",
    "rid": "rId168",
    "src": "media/image88.png",
    "kind": "formula"
   },
   {
    "t": "text",
    "v": "为例，经过第一次操作得到"
   },
   {
    "t": "text",
    "v": "55"
   },
   {
    "t": "text",
    "v": "，经过第二次操作得到"
   },
   {
    "t": "text",
    "v": "15"
   },
   {
    "t": "text",
    "v": "，"
   },
   {
    "t": "img",
    "rid": "rId170",
    "src": "media/image89.png",
    "kind": "formula"
   },
   {
    "t": "text",
    "v": "，"
   },
   {
    "t": "img",
    "rid": "rId172",
    "src": "media/image90.png",
    "kind": "formula"
   },
   {
    "t": "text",
    "v": "．所以"
   },
   {
    "t": "text",
    "v": "436"
   },
   {
    "t": "text",
    "v": "不是"
   },
   {
    "t": "text",
    "v": "19"
   },
   {
    "t": "text",
    "v": "的倍数．"
   },
   {
    "t": "break"
   },
   {
    "t": "text",
    "v": "当数"
   },
   {
    "t": "text",
    "v": "A"
   },
   {
    "t": "text",
    "v": "的位数更多时，这种方法依然适用．"
   },
   {
    "t": "break"
   },
   {
    "t": "img",
    "rid": "rId174",
    "src": "media/image91.png",
    "kind": "figure"
   },
   {
    "t": "break"
   },
   {
    "t": "text",
    "v": "【操作与说理】"
   },
   {
    "t": "break"
   },
   {
    "t": "text",
    "v": "（"
   },
   {
    "t": "text",
    "v": "1"
   },
   {
    "t": "text",
    "v": "）当"
   },
   {
    "t": "img",
    "rid": "rId175",
    "src": "media/image92.png",
    "kind": "formula"
   },
   {
    "t": "text",
    "v": "时，请你帮小天写出判断过程；"
   },
   {
    "t": "break"
   },
   {
    "t": "text",
    "v": "（"
   },
   {
    "t": "text",
    "v": "2"
   },
   {
    "t": "text",
    "v": "）小天尝试说明方法的道理，他发现解决问题的关键是每次判断过程的第一次操作，后续的操作道理都与第一次相同，于是他列出了如下表格进行分析．请你补全小天列出的表格："
   },
   {
    "t": "break"
   },
   {
    "t": "text",
    "v": "说明："
   },
   {
    "t": "img",
    "rid": "rId177",
    "src": "media/image93.png",
    "kind": "formula"
   },
   {
    "t": "text",
    "v": "表示"
   },
   {
    "t": "img",
    "rid": "rId179",
    "src": "media/image94.png",
    "kind": "formula"
   },
   {
    "t": "text",
    "v": "，其中"
   },
   {
    "t": "img",
    "rid": "rId181",
    "src": "media/image95.png",
    "kind": "formula"
   },
   {
    "t": "text",
    "v": "，"
   },
   {
    "t": "text",
    "v": "a"
   },
   {
    "t": "text",
    "v": "，"
   },
   {
    "t": "text",
    "v": "b"
   },
   {
    "t": "text",
    "v": "，"
   },
   {
    "t": "text",
    "v": "c"
   },
   {
    "t": "text",
    "v": "均为整数．"
   },
   {
    "t": "break"
   },
   {
    "t": "text",
    "v": "A"
   },
   {
    "t": "break"
   },
   {
    "t": "text",
    "v": "A"
   },
   {
    "t": "text",
    "v": "的表达式"
   },
   {
    "t": "break"
   },
   {
    "t": "text",
    "v": "第一次操作得到的和，记为"
   },
   {
    "t": "text",
    "v": "M"
   },
   {
    "t": "text",
    "v": "（"
   },
   {
    "t": "text",
    "v": "A"
   },
   {
    "t": "text",
    "v": "）"
   },
   {
    "t": "break"
   },
   {
    "t": "text",
    "v": "436"
   },
   {
    "t": "break"
   },
   {
    "t": "text",
    "v": "436"
   },
   {
    "t": "text",
    "v": "＝"
   },
   {
    "t": "text",
    "v": "10×43"
   },
   {
    "t": "text",
    "v": "＋"
   },
   {
    "t": "text",
    "v": "6"
   },
   {
    "t": "break"
   },
   {
    "t": "text",
    "v": "M"
   },
   {
    "t": "text",
    "v": "（"
   },
   {
    "t": "text",
    "v": "436"
   },
   {
    "t": "text",
    "v": "）＝"
   },
   {
    "t": "text",
    "v": "43"
   },
   {
    "t": "text",
    "v": "＋"
   },
   {
    "t": "text",
    "v": "2×6"
   },
   {
    "t": "break"
   },
   {
    "t": "text",
    "v": "532"
   },
   {
    "t": "break"
   },
   {
    "t": "text",
    "v": "532"
   },
   {
    "t": "text",
    "v": "＝"
   },
   {
    "t": "text",
    "v": "    "
   },
   {
    "t": "break"
   },
   {
    "t": "text",
    "v": "M"
   },
   {
    "t": "text",
    "v": "（"
   },
   {
    "t": "text",
    "v": "532"
   },
   {
    "t": "text",
    "v": "）＝"
   },
   {
    "t": "text",
    "v": "    "
   },
   {
    "t": "break"
   },
   {
    "t": "text",
    "v": "863"
   },
   {
    "t": "break"
   },
   {
    "t": "text",
    "v": "863"
   },
   {
    "t": "text",
    "v": "＝"
   },
   {
    "t": "text",
    "v": "10×86"
   },
   {
    "t": "text",
    "v": "＋"
   },
   {
    "t": "text",
    "v": "3"
   },
   {
    "t": "break"
   },
   {
    "t": "text",
    "v": "M"
   },
   {
    "t": "text",
    "v": "（"
   },
   {
    "t": "text",
    "v": "863"
   },
   {
    "t": "text",
    "v": "）＝"
   },
   {
    "t": "text",
    "v": "86"
   },
   {
    "t": "text",
    "v": "＋"
   },
   {
    "t": "text",
    "v": "2×3"
   },
   {
    "t": "break"
   },
   {
    "t": "text",
    "v": "……"
   },
   {
    "t": "break"
   },
   {
    "t": "text",
    "v": "……"
   },
   {
    "t": "break"
   },
   {
    "t": "text",
    "v": "……"
   },
   {
    "t": "break"
   },
   {
    "t": "img",
    "rid": "rId183",
    "src": "media/image96.png",
    "kind": "formula"
   },
   {
    "t": "break"
   },
   {
    "t": "img",
    "rid": "rId183",
    "src": "media/image96.png",
    "kind": "formula"
   },
   {
    "t": "text",
    "v": "＝"
   },
   {
    "t": "text",
    "v": "    "
   },
   {
    "t": "break"
   },
   {
    "t": "text",
    "v": "M"
   },
   {
    "t": "text",
    "v": "（"
   },
   {
    "t": "img",
    "rid": "rId183",
    "src": "media/image96.png",
    "kind": "formula"
   },
   {
    "t": "text",
    "v": "）＝"
   },
   {
    "t": "text",
    "v": "    "
   },
   {
    "t": "break"
   },
   {
    "t": "text",
    "v": "（"
   },
   {
    "t": "text",
    "v": "3"
   },
   {
    "t": "text",
    "v": "）利用以上信息说明：当"
   },
   {
    "t": "text",
    "v": "M"
   },
   {
    "t": "text",
    "v": "（"
   },
   {
    "t": "img",
    "rid": "rId183",
    "src": "media/image96.png",
    "kind": "formula"
   },
   {
    "t": "text",
    "v": "）是"
   },
   {
    "t": "text",
    "v": "19"
   },
   {
    "t": "text",
    "v": "的倍数时，"
   },
   {
    "t": "img",
    "rid": "rId183",
    "src": "media/image96.png",
    "kind": "formula"
   },
   {
    "t": "text",
    "v": "也是"
   },
   {
    "t": "text",
    "v": "19"
   },
   {
    "t": "text",
    "v": "的倍数．"
   }
  ],
  "rawParas": [
   "24. 【阅读与理解】小天同学看到如下的阅读材料：",
   "对于一个数A，以下给出了判断数A是否为19的倍数的一种方法：",
   "每次划掉该数的最后一位数字，将划掉这个数字的两倍与剩下的数相加得到一个和，称为一次操作，依此类推，直到数变为20以内的数为止．若最后得到的数为19.则最初的数A就是19的倍数，否则，数A就不是19的倍数．",
   "以⟨公式⟩为例，经过第一次操作得到55，经过第二次操作得到15，⟨公式⟩，⟨公式⟩．所以436不是19的倍数．",
   "当数A的位数更多时，这种方法依然适用．",
   "⟨公式⟩",
   "【操作与说理】",
   "（1）当⟨公式⟩时，请你帮小天写出判断过程；",
   "（2）小天尝试说明方法的道理，他发现解决问题的关键是每次判断过程的第一次操作，后续的操作道理都与第一次相同，于是他列出了如下表格进行分析．请你补全小天列出的表格：",
   "说明：⟨公式⟩表示⟨公式⟩，其中⟨公式⟩，a，b，c均为整数．",
   "A",
   "A的表达式",
   "第一次操作得到的和，记为M（A）",
   "436",
   "436＝10×43＋6",
   "M（436）＝43＋2×6",
   "532",
   "532＝",
   "M（532）＝",
   "863",
   "863＝10×86＋3",
   "M（863）＝86＋2×3",
   "……",
   "……",
   "……",
   "⟨公式⟩",
   "⟨公式⟩＝",
   "M（⟨公式⟩）＝",
   "（3）利用以上信息说明：当M（⟨公式⟩）是19的倍数时，⟨公式⟩也是19的倍数．"
  ],
  "options": null,
  "optionParts": null,
  "key": null,
  "answer": null,
  "officialKey": "（1）532是19的倍数，过程见解析；"
 },
 {
  "id": "p2021-q25",
  "paperId": "p2021",
  "year": "2021—2022",
  "no": 25,
  "qtype": "big",
  "chapter": "ch-geo",
  "cat": "作图",
  "score": 5,
  "diff": "hard",
  "topic": "三角尺拼角",
  "name": "三角尺画角",
  "bonus": true,
  "hasAnswer": true,
  "stemText": "小冬阅读了教材中“借助三角尺画角”的探究活动（如图1、图2的实物图所示），他在老师指导下画出了图1所对应的几何图形，并标注了所使用三角尺的相应角度（如图3），他发现用一副三角尺还能画出其他特殊角．⟨公式⟩⟨公式⟩⟨公式⟩⟨公式⟩请你借助三角尺完成以下画图，并标注所使用三角尺的相应角度．⟨公式⟩（1）画出图2对应的几何图形；⟨公式⟩（2）设计用一副三角尺画出⟨公式⟩角的画图方案，并画出相应的几何图形；⟨公式⟩（3）如图4，已知⟨公式⟩，画∠MON的角平分线OP．",
  "stemParts": [
   {
    "t": "text",
    "v": ""
   },
   {
    "t": "text",
    "v": "小冬阅读了教材中“借助三角尺画角”的探究活动（如图"
   },
   {
    "t": "text",
    "v": "1"
   },
   {
    "t": "text",
    "v": "、图"
   },
   {
    "t": "text",
    "v": "2"
   },
   {
    "t": "text",
    "v": "的实物图所示），他在老师指导下画出了图"
   },
   {
    "t": "text",
    "v": "1"
   },
   {
    "t": "text",
    "v": "所对应的几何图形，并标注了所使用三角尺的相应角度（如图"
   },
   {
    "t": "text",
    "v": "3"
   },
   {
    "t": "text",
    "v": "），他发现用一副三角尺还能画出其他特殊角．"
   },
   {
    "t": "break"
   },
   {
    "t": "img",
    "rid": "rId189",
    "src": "media/image97.png",
    "kind": "figure"
   },
   {
    "t": "img",
    "rid": "rId190",
    "src": "media/image98.png",
    "kind": "figure"
   },
   {
    "t": "break"
   },
   {
    "t": "text",
    "v": "请你借助三角尺完成以下画图，并标注所使用三角尺的相应角度．"
   },
   {
    "t": "break"
   },
   {
    "t": "text",
    "v": "（"
   },
   {
    "t": "text",
    "v": "1"
   },
   {
    "t": "text",
    "v": "）画出图"
   },
   {
    "t": "text",
    "v": "2"
   },
   {
    "t": "text",
    "v": "对应的几何图形；"
   },
   {
    "t": "break"
   },
   {
    "t": "text",
    "v": "（"
   },
   {
    "t": "text",
    "v": "2"
   },
   {
    "t": "text",
    "v": "）设计用一副三角尺画出"
   },
   {
    "t": "img",
    "rid": "rId191",
    "src": "media/image99.png",
    "kind": "formula"
   },
   {
    "t": "text",
    "v": "角的画图方案，并画出相应的几何图形；"
   },
   {
    "t": "break"
   },
   {
    "t": "text",
    "v": "（"
   },
   {
    "t": "text",
    "v": "3"
   },
   {
    "t": "text",
    "v": "）如图"
   },
   {
    "t": "text",
    "v": "4"
   },
   {
    "t": "text",
    "v": "，已知"
   },
   {
    "t": "img",
    "rid": "rId193",
    "src": "media/image100.png",
    "kind": "formula"
   },
   {
    "t": "text",
    "v": "，画∠"
   },
   {
    "t": "text",
    "v": "MON"
   },
   {
    "t": "text",
    "v": "的角平分线"
   },
   {
    "t": "text",
    "v": "OP"
   },
   {
    "t": "text",
    "v": "．"
   }
  ],
  "rawParas": [
   "25. 小冬阅读了教材中“借助三角尺画角”的探究活动（如图1、图2的实物图所示），他在老师指导下画出了图1所对应的几何图形，并标注了所使用三角尺的相应角度（如图3），他发现用一副三角尺还能画出其他特殊角．",
   "⟨公式⟩⟨公式⟩",
   "请你借助三角尺完成以下画图，并标注所使用三角尺的相应角度．",
   "（1）画出图2对应的几何图形；",
   "（2）设计用一副三角尺画出⟨公式⟩角的画图方案，并画出相应的几何图形；",
   "（3）如图4，已知⟨公式⟩，画∠MON的角平分线OP．"
  ],
  "options": null,
  "optionParts": null,
  "key": null,
  "answer": null,
  "officialKey": "（1）见解析；（2）见解析；（3）见解析"
 },
 {
  "id": "p2021-q26",
  "paperId": "p2021",
  "year": "2021—2022",
  "no": 26,
  "qtype": "big",
  "chapter": "ch-rational",
  "cat": "新定义",
  "score": 5,
  "diff": "top",
  "topic": "新定义（数轴类）",
  "name": "新定义「k 星点」",
  "bonus": true,
  "hasAnswer": true,
  "stemText": "我们将数轴上点P表示的数记为⟨公式⟩．对于数轴上不同的三个点M，N，T，若有⟨公式⟩，其中k为有理数，则称点N是点M关于点T的“k星点”．已知在数轴上，原点为O，点A，点B表示的数分别为⟨公式⟩．⟨公式⟩．⟨公式⟩⟨公式⟩⟨公式⟩（1）若点B是点A关于原点O的“k星点”，则k＝___；若点C是点A关于点B的“2星点”，则⟨公式⟩＝___：⟨公式⟩（2）若线段AB在数轴上沿正方向运动，每秒运动1个单位长度，取线段AB的中点D．是否存在某一时刻，使得点D是点A关于点O的“－2星点”？若存在，求出线段AB的运动时间；若不存在，请说明理由；⟨公式⟩（3）点Q在数轴上运动（点Q不与A，B两点重合），作点A关于点Q的“3星点”，记为⟨公式⟩，作点B关于点Q的“3星点”，记为⟨公式⟩．当点Q运动时，⟨公式⟩是否存在最小值？若存在，求出最小值及相应点Q的位置；若不存在，请说明理由．",
  "stemParts": [
   {
    "t": "text",
    "v": ""
   },
   {
    "t": "text",
    "v": "我们将数轴上点"
   },
   {
    "t": "text",
    "v": "P"
   },
   {
    "t": "text",
    "v": "表示的数记为"
   },
   {
    "t": "img",
    "rid": "rId195",
    "src": "media/image101.png",
    "kind": "formula"
   },
   {
    "t": "text",
    "v": "．对于数轴上不同的三个点"
   },
   {
    "t": "text",
    "v": "M"
   },
   {
    "t": "text",
    "v": "，"
   },
   {
    "t": "text",
    "v": "N"
   },
   {
    "t": "text",
    "v": "，"
   },
   {
    "t": "text",
    "v": "T"
   },
   {
    "t": "text",
    "v": "，若有"
   },
   {
    "t": "img",
    "rid": "rId197",
    "src": "media/image102.png",
    "kind": "formula"
   },
   {
    "t": "text",
    "v": "，其中"
   },
   {
    "t": "text",
    "v": "k"
   },
   {
    "t": "text",
    "v": "为有理数，则称点"
   },
   {
    "t": "text",
    "v": "N"
   },
   {
    "t": "text",
    "v": "是点"
   },
   {
    "t": "text",
    "v": "M"
   },
   {
    "t": "text",
    "v": "关于点"
   },
   {
    "t": "text",
    "v": "T"
   },
   {
    "t": "text",
    "v": "的“"
   },
   {
    "t": "text",
    "v": "k"
   },
   {
    "t": "text",
    "v": "星点”．已知在数轴上，原点为"
   },
   {
    "t": "text",
    "v": "O"
   },
   {
    "t": "text",
    "v": "，点"
   },
   {
    "t": "text",
    "v": "A"
   },
   {
    "t": "text",
    "v": "，点"
   },
   {
    "t": "text",
    "v": "B"
   },
   {
    "t": "text",
    "v": "表示的数分别为"
   },
   {
    "t": "img",
    "rid": "rId199",
    "src": "media/image103.png",
    "kind": "formula"
   },
   {
    "t": "text",
    "v": "．"
   },
   {
    "t": "img",
    "rid": "rId201",
    "src": "media/image104.png",
    "kind": "formula"
   },
   {
    "t": "text",
    "v": "．"
   },
   {
    "t": "break"
   },
   {
    "t": "img",
    "rid": "rId203",
    "src": "media/image105.png",
    "kind": "figure"
   },
   {
    "t": "break"
   },
   {
    "t": "text",
    "v": "（"
   },
   {
    "t": "text",
    "v": "1"
   },
   {
    "t": "text",
    "v": "）若点"
   },
   {
    "t": "text",
    "v": "B"
   },
   {
    "t": "text",
    "v": "是点"
   },
   {
    "t": "text",
    "v": "A"
   },
   {
    "t": "text",
    "v": "关于原点"
   },
   {
    "t": "text",
    "v": "O"
   },
   {
    "t": "text",
    "v": "的“"
   },
   {
    "t": "text",
    "v": "k"
   },
   {
    "t": "text",
    "v": "星点”，则"
   },
   {
    "t": "text",
    "v": "k"
   },
   {
    "t": "text",
    "v": "＝"
   },
   {
    "t": "text",
    "v": "___"
   },
   {
    "t": "text",
    "v": "；若点"
   },
   {
    "t": "text",
    "v": "C"
   },
   {
    "t": "text",
    "v": "是点"
   },
   {
    "t": "text",
    "v": "A"
   },
   {
    "t": "text",
    "v": "关于点"
   },
   {
    "t": "text",
    "v": "B"
   },
   {
    "t": "text",
    "v": "的“"
   },
   {
    "t": "text",
    "v": "2"
   },
   {
    "t": "text",
    "v": "星点”，则"
   },
   {
    "t": "img",
    "rid": "rId204",
    "src": "media/image106.png",
    "kind": "formula"
   },
   {
    "t": "text",
    "v": "＝"
   },
   {
    "t": "text",
    "v": "___"
   },
   {
    "t": "text",
    "v": "："
   },
   {
    "t": "break"
   },
   {
    "t": "text",
    "v": "（"
   },
   {
    "t": "text",
    "v": "2"
   },
   {
    "t": "text",
    "v": "）若线段"
   },
   {
    "t": "text",
    "v": "AB"
   },
   {
    "t": "text",
    "v": "在数轴上沿正方向运动，每秒运动"
   },
   {
    "t": "text",
    "v": "1"
   },
   {
    "t": "text",
    "v": "个单位长度，取线段"
   },
   {
    "t": "text",
    "v": "AB"
   },
   {
    "t": "text",
    "v": "的中点"
   },
   {
    "t": "text",
    "v": "D"
   },
   {
    "t": "text",
    "v": "．是否存在某一时刻，使得点"
   },
   {
    "t": "text",
    "v": "D"
   },
   {
    "t": "text",
    "v": "是点"
   },
   {
    "t": "text",
    "v": "A"
   },
   {
    "t": "text",
    "v": "关于点"
   },
   {
    "t": "text",
    "v": "O"
   },
   {
    "t": "text",
    "v": "的“－"
   },
   {
    "t": "text",
    "v": "2"
   },
   {
    "t": "text",
    "v": "星点”？若存在，求出线段"
   },
   {
    "t": "text",
    "v": "AB"
   },
   {
    "t": "text",
    "v": "的运动时间；若不存在，请说明理由；"
   },
   {
    "t": "break"
   },
   {
    "t": "text",
    "v": "（"
   },
   {
    "t": "text",
    "v": "3"
   },
   {
    "t": "text",
    "v": "）点"
   },
   {
    "t": "text",
    "v": "Q"
   },
   {
    "t": "text",
    "v": "在数轴上运动（点"
   },
   {
    "t": "text",
    "v": "Q"
   },
   {
    "t": "text",
    "v": "不与"
   },
   {
    "t": "text",
    "v": "A"
   },
   {
    "t": "text",
    "v": "，"
   },
   {
    "t": "text",
    "v": "B"
   },
   {
    "t": "text",
    "v": "两点重合），作点"
   },
   {
    "t": "text",
    "v": "A"
   },
   {
    "t": "text",
    "v": "关于点"
   },
   {
    "t": "text",
    "v": "Q"
   },
   {
    "t": "text",
    "v": "的"
   },
   {
    "t": "text",
    "v": "“3"
   },
   {
    "t": "text",
    "v": "星点"
   },
   {
    "t": "text",
    "v": "”"
   },
   {
    "t": "text",
    "v": "，记为"
   },
   {
    "t": "img",
    "rid": "rId206",
    "src": "media/image107.png",
    "kind": "formula"
   },
   {
    "t": "text",
    "v": "，作点"
   },
   {
    "t": "text",
    "v": "B"
   },
   {
    "t": "text",
    "v": "关于点"
   },
   {
    "t": "text",
    "v": "Q"
   },
   {
    "t": "text",
    "v": "的“"
   },
   {
    "t": "text",
    "v": "3"
   },
   {
    "t": "text",
    "v": "星点”，记为"
   },
   {
    "t": "img",
    "rid": "rId208",
    "src": "media/image108.png",
    "kind": "formula"
   },
   {
    "t": "text",
    "v": "．当点"
   },
   {
    "t": "text",
    "v": "Q"
   },
   {
    "t": "text",
    "v": "运动时，"
   },
   {
    "t": "img",
    "rid": "rId210",
    "src": "media/image109.png",
    "kind": "formula"
   },
   {
    "t": "text",
    "v": "是否存在最小值？若存在，求出最小值及相应点"
   },
   {
    "t": "text",
    "v": "Q"
   },
   {
    "t": "text",
    "v": "的位置；若不存在，请说明理由．"
   }
  ],
  "rawParas": [
   "26. 我们将数轴上点P表示的数记为⟨公式⟩．对于数轴上不同的三个点M，N，T，若有⟨公式⟩，其中k为有理数，则称点N是点M关于点T的“k星点”．已知在数轴上，原点为O，点A，点B表示的数分别为⟨公式⟩．⟨公式⟩．",
   "⟨公式⟩",
   "（1）若点B是点A关于原点O的“k星点”，则k＝___；若点C是点A关于点B的“2星点”，则⟨公式⟩＝___：",
   "（2）若线段AB在数轴上沿正方向运动，每秒运动1个单位长度，取线段AB的中点D．是否存在某一时刻，使得点D是点A关于点O的“－2星点”？若存在，求出线段AB的运动时间；若不存在，请说明理由；",
   "（3）点Q在数轴上运动（点Q不与A，B两点重合），作点A关于点Q的“3星点”，记为⟨公式⟩，作点B关于点Q的“3星点”，记为⟨公式⟩．当点Q运动时，⟨公式⟩是否存在最小值？若存在，求出最小值及相应点Q的位置；若不存在，请说明理由．"
  ],
  "options": null,
  "optionParts": null,
  "key": null,
  "answer": null,
  "officialKey": "（1），；"
 },
 {
  "id": "p2022-q1",
  "paperId": "p2022",
  "year": "2022—2023",
  "no": 1,
  "qtype": "single",
  "chapter": "ch-rational",
  "cat": "概念",
  "score": 2,
  "diff": "easy",
  "topic": "相反数",
  "name": "相反数",
  "bonus": false,
  "hasAnswer": true,
  "stemText": "⟨公式⟩的相反数是（     ）",
  "stemParts": [
   {
    "t": "text",
    "v": ""
   },
   {
    "t": "img",
    "rid": "rId8",
    "src": "media/image4.png",
    "kind": "formula"
   },
   {
    "t": "text",
    "v": "的相反数是（"
   },
   {
    "t": "text",
    "v": "     ）"
   }
  ],
  "rawParas": [
   "1. ⟨公式⟩的相反数是（     ）",
   "A. ⟨公式⟩B. ⟨公式⟩C. ⟨公式⟩D. ⟨公式⟩"
  ],
  "options": [
   "⟨公式⟩",
   "⟨公式⟩",
   "⟨公式⟩",
   "⟨公式⟩"
  ],
  "optionParts": [
   [
    {
     "t": "img",
     "rid": "rId10",
     "src": "media/image5.png",
     "kind": "formula"
    }
   ],
   [
    {
     "t": "img",
     "rid": "rId12",
     "src": "media/image6.png",
     "kind": "formula"
    }
   ],
   [
    {
     "t": "img",
     "rid": "rId8",
     "src": "media/image4.png",
     "kind": "formula"
    }
   ],
   [
    {
     "t": "img",
     "rid": "rId15",
     "src": "media/image7.png",
     "kind": "formula"
    }
   ]
  ],
  "key": 2,
  "answer": "⟨公式⟩",
  "officialKey": "C"
 },
 {
  "id": "p2022-q2",
  "paperId": "p2022",
  "year": "2022—2023",
  "no": 2,
  "qtype": "single",
  "chapter": "ch-op",
  "cat": "概念",
  "score": 2,
  "diff": "easy",
  "topic": "科学记数法",
  "name": "科学记数法",
  "bonus": false,
  "hasAnswer": true,
  "stemText": "红树林、海草床和滨海盐沼组成三大滨海“蓝碳”生态系统．相关数据显示，按全球平均值估算，我国三大滨海“蓝碳”生态系统的年碳汇量最高可达约3080000吨二氧化碳．将3080000用科学记数法表示应为（    ）",
  "stemParts": [
   {
    "t": "text",
    "v": ""
   },
   {
    "t": "text",
    "v": "红树林、海草床和滨海盐沼组成三大滨海“蓝碳”生态系统．相关数据显示，按全球平均值估算，我国三大滨海“蓝碳”生态系统的年碳汇量最高可达约"
   },
   {
    "t": "text",
    "v": "3080000"
   },
   {
    "t": "text",
    "v": "吨二氧化碳．将"
   },
   {
    "t": "text",
    "v": "3080000"
   },
   {
    "t": "text",
    "v": "用科学记数法表示应为（"
   },
   {
    "t": "text",
    "v": "    "
   },
   {
    "t": "text",
    "v": "）"
   }
  ],
  "rawParas": [
   "2. 红树林、海草床和滨海盐沼组成三大滨海“蓝碳”生态系统．相关数据显示，按全球平均值估算，我国三大滨海“蓝碳”生态系统的年碳汇量最高可达约3080000吨二氧化碳．将3080000用科学记数法表示应为（    ）",
   "A. ⟨公式⟩B. ⟨公式⟩C. ⟨公式⟩D. ⟨公式⟩"
  ],
  "options": [
   "⟨公式⟩",
   "⟨公式⟩",
   "⟨公式⟩",
   "⟨公式⟩"
  ],
  "optionParts": [
   [
    {
     "t": "img",
     "rid": "rId17",
     "src": "media/image8.png",
     "kind": "formula"
    }
   ],
   [
    {
     "t": "img",
     "rid": "rId19",
     "src": "media/image9.png",
     "kind": "formula"
    }
   ],
   [
    {
     "t": "img",
     "rid": "rId21",
     "src": "media/image10.png",
     "kind": "formula"
    }
   ],
   [
    {
     "t": "img",
     "rid": "rId23",
     "src": "media/image11.png",
     "kind": "formula"
    }
   ]
  ],
  "key": 1,
  "answer": "⟨公式⟩",
  "officialKey": "B"
 },
 {
  "id": "p2022-q3",
  "paperId": "p2022",
  "year": "2022—2023",
  "no": 3,
  "qtype": "single",
  "chapter": "ch-geo",
  "cat": "空间",
  "score": 2,
  "diff": "mid",
  "topic": "展开图识别",
  "name": "展开图识别（棱柱）",
  "bonus": false,
  "hasAnswer": true,
  "stemText": "如图是某个几何体的展开图，则该几何体是（    ）⟨公式⟩⟨公式⟩",
  "stemParts": [
   {
    "t": "text",
    "v": ""
   },
   {
    "t": "text",
    "v": "如图是某个几何体的展开图，则该几何体是（"
   },
   {
    "t": "text",
    "v": "    "
   },
   {
    "t": "text",
    "v": "）"
   },
   {
    "t": "break"
   },
   {
    "t": "img",
    "rid": "rId25",
    "src": "media/image12.png",
    "kind": "figure"
   }
  ],
  "rawParas": [
   "3. 如图是某个几何体的展开图，则该几何体是（    ）",
   "⟨公式⟩",
   "A. 五棱柱B. 长方体C. 五棱锥D. 六棱柱"
  ],
  "options": [
   "五棱柱",
   "长方体",
   "五棱锥",
   "六棱柱"
  ],
  "optionParts": [
   [
    {
     "t": "text",
     "v": "五棱柱"
    }
   ],
   [
    {
     "t": "text",
     "v": "长方体"
    }
   ],
   [
    {
     "t": "text",
     "v": "五棱锥"
    }
   ],
   [
    {
     "t": "text",
     "v": "六棱柱"
    }
   ]
  ],
  "key": 0,
  "answer": "五棱柱",
  "officialKey": "A"
 },
 {
  "id": "p2022-q4",
  "paperId": "p2022",
  "year": "2022—2023",
  "no": 4,
  "qtype": "single",
  "chapter": "ch-rational",
  "cat": "概念",
  "score": 2,
  "diff": "mid",
  "topic": "数轴读符号",
  "name": "数轴判断符号",
  "bonus": false,
  "hasAnswer": true,
  "stemText": "有理数⟨公式⟩在数轴上的对应点的位置如图所示，则下列结论正确的是（    ）⟨公式⟩⟨公式⟩",
  "stemParts": [
   {
    "t": "text",
    "v": ""
   },
   {
    "t": "text",
    "v": "有理数"
   },
   {
    "t": "img",
    "rid": "rId26",
    "src": "media/image13.png",
    "kind": "formula"
   },
   {
    "t": "text",
    "v": "在数轴上的对应点的位置如图所示，则下列结论正确的是（"
   },
   {
    "t": "text",
    "v": "    "
   },
   {
    "t": "text",
    "v": "）"
   },
   {
    "t": "break"
   },
   {
    "t": "img",
    "rid": "rId28",
    "src": "media/image14.png",
    "kind": "figure"
   }
  ],
  "rawParas": [
   "4. 有理数⟨公式⟩在数轴上的对应点的位置如图所示，则下列结论正确的是（    ）",
   "⟨公式⟩",
   "A. ⟨公式⟩B. ⟨公式⟩C. ⟨公式⟩D. ⟨公式⟩"
  ],
  "options": [
   "⟨公式⟩",
   "⟨公式⟩",
   "⟨公式⟩",
   "⟨公式⟩"
  ],
  "optionParts": [
   [
    {
     "t": "img",
     "rid": "rId29",
     "src": "media/image15.png",
     "kind": "formula"
    }
   ],
   [
    {
     "t": "img",
     "rid": "rId31",
     "src": "media/image16.png",
     "kind": "formula"
    }
   ],
   [
    {
     "t": "img",
     "rid": "rId33",
     "src": "media/image17.png",
     "kind": "formula"
    }
   ],
   [
    {
     "t": "img",
     "rid": "rId35",
     "src": "media/image18.png",
     "kind": "formula"
    }
   ]
  ],
  "key": 1,
  "answer": "⟨公式⟩",
  "officialKey": "B"
 },
 {
  "id": "p2022-q5",
  "paperId": "p2022",
  "year": "2022—2023",
  "no": 5,
  "qtype": "single",
  "chapter": "ch-poly",
  "cat": "计算",
  "score": 2,
  "diff": "easy",
  "topic": "合并同类项辨析",
  "name": "整式加减辨析",
  "bonus": false,
  "hasAnswer": true,
  "stemText": "下列计算中正确的是（    ）",
  "stemParts": [
   {
    "t": "text",
    "v": ""
   },
   {
    "t": "text",
    "v": "下列计算中正确的是（"
   },
   {
    "t": "text",
    "v": "    "
   },
   {
    "t": "text",
    "v": "）"
   }
  ],
  "rawParas": [
   "5. 下列计算中正确的是（    ）",
   "A. ⟨公式⟩B. ⟨公式⟩",
   "C. ⟨公式⟩D. ⟨公式⟩"
  ],
  "options": [
   "⟨公式⟩",
   "⟨公式⟩",
   "⟨公式⟩",
   "⟨公式⟩"
  ],
  "optionParts": [
   [
    {
     "t": "img",
     "rid": "rId37",
     "src": "media/image19.png",
     "kind": "formula"
    }
   ],
   [
    {
     "t": "img",
     "rid": "rId39",
     "src": "media/image20.png",
     "kind": "formula"
    }
   ],
   [
    {
     "t": "img",
     "rid": "rId41",
     "src": "media/image21.png",
     "kind": "formula"
    }
   ],
   [
    {
     "t": "img",
     "rid": "rId43",
     "src": "media/image22.png",
     "kind": "formula"
    }
   ]
  ],
  "key": 3,
  "answer": "⟨公式⟩",
  "officialKey": "D"
 },
 {
  "id": "p2022-q6",
  "paperId": "p2022",
  "year": "2022—2023",
  "no": 6,
  "qtype": "single",
  "chapter": "ch-eq",
  "cat": "建模",
  "score": 2,
  "diff": "mid",
  "topic": "余角补角列方程",
  "name": "补角列方程",
  "bonus": false,
  "hasAnswer": true,
  "stemText": "已知一个角比它的补角小⟨公式⟩，则这个角的大小为（    ）",
  "stemParts": [
   {
    "t": "text",
    "v": ""
   },
   {
    "t": "text",
    "v": "已知一个角比它的补角小"
   },
   {
    "t": "img",
    "rid": "rId45",
    "src": "media/image23.png",
    "kind": "formula"
   },
   {
    "t": "text",
    "v": "，则这个角的大小为（"
   },
   {
    "t": "text",
    "v": "    "
   },
   {
    "t": "text",
    "v": "）"
   }
  ],
  "rawParas": [
   "6. 已知一个角比它的补角小⟨公式⟩，则这个角的大小为（    ）",
   "A. ⟨公式⟩B. ⟨公式⟩C. ⟨公式⟩D. ⟨公式⟩"
  ],
  "options": [
   "⟨公式⟩",
   "⟨公式⟩",
   "⟨公式⟩",
   "⟨公式⟩"
  ],
  "optionParts": [
   [
    {
     "t": "img",
     "rid": "rId45",
     "src": "media/image23.png",
     "kind": "formula"
    }
   ],
   [
    {
     "t": "img",
     "rid": "rId48",
     "src": "media/image24.png",
     "kind": "formula"
    }
   ],
   [
    {
     "t": "img",
     "rid": "rId50",
     "src": "media/image25.png",
     "kind": "formula"
    }
   ],
   [
    {
     "t": "img",
     "rid": "rId52",
     "src": "media/image26.png",
     "kind": "formula"
    }
   ]
  ],
  "key": 2,
  "answer": "⟨公式⟩",
  "officialKey": "C"
 },
 {
  "id": "p2022-q7",
  "paperId": "p2022",
  "year": "2022—2023",
  "no": 7,
  "qtype": "single",
  "chapter": "ch-expr",
  "cat": "计算",
  "score": 2,
  "diff": "mid",
  "topic": "代数式求值",
  "name": "整体代入求值",
  "bonus": false,
  "hasAnswer": true,
  "stemText": "若⟨公式⟩，则⟨公式⟩的值为（   ）",
  "stemParts": [
   {
    "t": "text",
    "v": ""
   },
   {
    "t": "text",
    "v": "若"
   },
   {
    "t": "img",
    "rid": "rId54",
    "src": "media/image27.png",
    "kind": "formula"
   },
   {
    "t": "text",
    "v": "，则"
   },
   {
    "t": "img",
    "rid": "rId56",
    "src": "media/image28.png",
    "kind": "formula"
   },
   {
    "t": "text",
    "v": "的值为（"
   },
   {
    "t": "text",
    "v": "   "
   },
   {
    "t": "text",
    "v": "）"
   }
  ],
  "rawParas": [
   "7. 若⟨公式⟩，则⟨公式⟩的值为（   ）",
   "A. 14B. 2C. ⟨公式⟩D. ⟨公式⟩"
  ],
  "options": [
   "14",
   "2",
   "⟨公式⟩",
   "⟨公式⟩"
  ],
  "optionParts": [
   [
    {
     "t": "text",
     "v": "14"
    }
   ],
   [
    {
     "t": "text",
     "v": "2"
    }
   ],
   [
    {
     "t": "img",
     "rid": "rId58",
     "src": "media/image29.png",
     "kind": "formula"
    }
   ],
   [
    {
     "t": "img",
     "rid": "rId60",
     "src": "media/image30.png",
     "kind": "formula"
    }
   ]
  ],
  "key": 3,
  "answer": "⟨公式⟩",
  "officialKey": "D"
 },
 {
  "id": "p2022-q8",
  "paperId": "p2022",
  "year": "2022—2023",
  "no": 8,
  "qtype": "single",
  "chapter": "ch-expr",
  "cat": "推理",
  "score": 2,
  "diff": "hard",
  "topic": "图形规律探究",
  "name": "图形规律（卡片拼图）",
  "bonus": false,
  "hasAnswer": true,
  "stemText": "用边长相等的正方形和等边三角形卡片按如图所示的方式和规律拼出图形．拼第1个图形所用两种卡片的总数为7枚，拼第2个图形所用两种卡片的总数为12枚⟨公式⟩若按照这样的规律拼出的第⟨公式⟩个图形中，所用正方形卡片比等边三角形卡片多10枚，则拼第⟨公式⟩个图形所用两种卡片的总数为（    ）⟨公式⟩⟨公式⟩",
  "stemParts": [
   {
    "t": "text",
    "v": ""
   },
   {
    "t": "text",
    "v": "用边长相等的正方形和等边三角形卡片按如图所示的方式和规律拼出图形．拼第"
   },
   {
    "t": "text",
    "v": "1"
   },
   {
    "t": "text",
    "v": "个图形所用两种卡片的总数为"
   },
   {
    "t": "text",
    "v": "7"
   },
   {
    "t": "text",
    "v": "枚，拼第"
   },
   {
    "t": "text",
    "v": "2"
   },
   {
    "t": "text",
    "v": "个图形所用两种卡片的总数为"
   },
   {
    "t": "text",
    "v": "12"
   },
   {
    "t": "text",
    "v": "枚"
   },
   {
    "t": "img",
    "rid": "rId62",
    "src": "media/image31.png",
    "kind": "formula"
   },
   {
    "t": "text",
    "v": "若按照这样的规律拼出的第"
   },
   {
    "t": "img",
    "rid": "rId64",
    "src": "media/image32.png",
    "kind": "formula"
   },
   {
    "t": "text",
    "v": "个图形中，所用正方形卡片比等边三角形卡片多"
   },
   {
    "t": "text",
    "v": "10"
   },
   {
    "t": "text",
    "v": "枚，则拼第"
   },
   {
    "t": "img",
    "rid": "rId64",
    "src": "media/image32.png",
    "kind": "formula"
   },
   {
    "t": "text",
    "v": "个图形所用两种卡片的总数为（"
   },
   {
    "t": "text",
    "v": "    "
   },
   {
    "t": "text",
    "v": "）"
   },
   {
    "t": "break"
   },
   {
    "t": "img",
    "rid": "rId67",
    "src": "media/image33.png",
    "kind": "figure"
   }
  ],
  "rawParas": [
   "8. 用边长相等的正方形和等边三角形卡片按如图所示的方式和规律拼出图形．拼第1个图形所用两种卡片的总数为7枚，拼第2个图形所用两种卡片的总数为12枚⟨公式⟩若按照这样的规律拼出的第⟨公式⟩个图形中，所用正方形卡片比等边三角形卡片多10枚，则拼第⟨公式⟩个图形所用两种卡片的总数为（    ）",
   "⟨公式⟩",
   "A. 57枚B. 52枚C. 50枚D. 47枚"
  ],
  "options": [
   "57枚",
   "52枚",
   "50枚",
   "47枚"
  ],
  "optionParts": [
   [
    {
     "t": "text",
     "v": "57枚"
    }
   ],
   [
    {
     "t": "text",
     "v": "52枚"
    }
   ],
   [
    {
     "t": "text",
     "v": "50枚"
    }
   ],
   [
    {
     "t": "text",
     "v": "47枚"
    }
   ]
  ],
  "key": 1,
  "answer": "52枚",
  "officialKey": "B"
 },
 {
  "id": "p2022-q9",
  "paperId": "p2022",
  "year": "2022—2023",
  "no": 9,
  "qtype": "calc",
  "chapter": "ch-op",
  "cat": "概念",
  "score": 2,
  "diff": "easy",
  "topic": "近似数与精确度",
  "name": "四舍五入",
  "bonus": false,
  "hasAnswer": true,
  "stemText": "用四舍五入法把4.0692精确到0.01，所得到的近似数为______．",
  "stemParts": [
   {
    "t": "text",
    "v": ""
   },
   {
    "t": "text",
    "v": "用四舍五入法把"
   },
   {
    "t": "text",
    "v": "4.0692"
   },
   {
    "t": "text",
    "v": "精确到"
   },
   {
    "t": "text",
    "v": "0.01"
   },
   {
    "t": "text",
    "v": "，所得到的近似数为"
   },
   {
    "t": "text",
    "v": "______"
   },
   {
    "t": "text",
    "v": "．"
   }
  ],
  "rawParas": [
   "9. 用四舍五入法把4.0692精确到0.01，所得到的近似数为______．"
  ],
  "options": null,
  "optionParts": null,
  "key": null,
  "answer": "4.07",
  "accept": [
   "4.07"
  ],
  "officialKey": "4.07"
 },
 {
  "id": "p2022-q10",
  "paperId": "p2022",
  "year": "2022—2023",
  "no": 10,
  "qtype": "calc",
  "chapter": "ch-geo",
  "cat": "计算",
  "score": 2,
  "diff": "easy",
  "topic": "角度换算（度分秒）",
  "name": "角度换算（乘 4）",
  "bonus": false,
  "hasAnswer": true,
  "stemText": "计算：⟨公式⟩______°．",
  "stemParts": [
   {
    "t": "text",
    "v": ""
   },
   {
    "t": "text",
    "v": "计算："
   },
   {
    "t": "img",
    "rid": "rId68",
    "src": "media/image34.png",
    "kind": "formula"
   },
   {
    "t": "text",
    "v": "______"
   },
   {
    "t": "text",
    "v": "°"
   },
   {
    "t": "text",
    "v": "．"
   }
  ],
  "rawParas": [
   "10. 计算：⟨公式⟩______°．"
  ],
  "options": null,
  "optionParts": null,
  "key": null,
  "answer": "125",
  "accept": [
   "125"
  ],
  "officialKey": "125"
 },
 {
  "id": "p2022-q11",
  "paperId": "p2022",
  "year": "2022—2023",
  "no": 11,
  "qtype": "calc",
  "chapter": "ch-rational",
  "cat": "概念",
  "score": 2,
  "diff": "mid",
  "topic": "绝对值非负性",
  "name": "绝对值非负性求值",
  "bonus": false,
  "hasAnswer": true,
  "stemText": "若⟨公式⟩，则⟨公式⟩的值为______．",
  "stemParts": [
   {
    "t": "text",
    "v": ""
   },
   {
    "t": "text",
    "v": "若"
   },
   {
    "t": "img",
    "rid": "rId70",
    "src": "media/image35.png",
    "kind": "formula"
   },
   {
    "t": "text",
    "v": "，则"
   },
   {
    "t": "img",
    "rid": "rId72",
    "src": "media/image36.png",
    "kind": "formula"
   },
   {
    "t": "text",
    "v": "的值为"
   },
   {
    "t": "text",
    "v": "______"
   },
   {
    "t": "text",
    "v": "．"
   }
  ],
  "rawParas": [
   "11. 若⟨公式⟩，则⟨公式⟩的值为______．"
  ],
  "options": null,
  "optionParts": null,
  "key": null,
  "answer": "-9",
  "accept": [
   "-9"
  ],
  "officialKey": "-9"
 },
 {
  "id": "p2022-q12",
  "paperId": "p2022",
  "year": "2022—2023",
  "no": 12,
  "qtype": "calc",
  "chapter": "ch-poly",
  "cat": "概念",
  "score": 2,
  "diff": "mid",
  "topic": "单项式概念（构造）",
  "name": "构造单项式（系数/次数）",
  "bonus": false,
  "hasAnswer": true,
  "stemText": "写出一个同时满足以下两个条件的单项式：①系数是负数；②次数是5．这个单项式可以是：______．",
  "stemParts": [
   {
    "t": "text",
    "v": ""
   },
   {
    "t": "text",
    "v": "写出一个同时满足以下两个条件的单项式："
   },
   {
    "t": "text",
    "v": "①"
   },
   {
    "t": "text",
    "v": "系数是负数；"
   },
   {
    "t": "text",
    "v": "②"
   },
   {
    "t": "text",
    "v": "次数是"
   },
   {
    "t": "text",
    "v": "5"
   },
   {
    "t": "text",
    "v": "．这个单项式可以是："
   },
   {
    "t": "text",
    "v": "______"
   },
   {
    "t": "text",
    "v": "．"
   }
  ],
  "rawParas": [
   "12. 写出一个同时满足以下两个条件的单项式：①系数是负数；②次数是5．这个单项式可以是：______．"
  ],
  "options": null,
  "optionParts": null,
  "key": null,
  "answer": "-2x^3y^2",
  "accept": [
   "-2x^3y^2"
  ],
  "officialKey": "-2x^3y^2"
 },
 {
  "id": "p2022-q13",
  "paperId": "p2022",
  "year": "2022—2023",
  "no": 13,
  "qtype": "calc",
  "chapter": "ch-geo",
  "cat": "计算",
  "score": 2,
  "diff": "mid",
  "topic": "线段中点计算",
  "name": "线段中点",
  "bonus": false,
  "hasAnswer": true,
  "stemText": "如图，⟨公式⟩是线段⟨公式⟩的中点，点⟨公式⟩在线段⟨公式⟩上，⟨公式⟩是线段⟨公式⟩的中点．若⟨公式⟩，⟨公式⟩，则⟨公式⟩的长为______．⟨公式⟩⟨公式⟩",
  "stemParts": [
   {
    "t": "text",
    "v": ""
   },
   {
    "t": "text",
    "v": "如图，"
   },
   {
    "t": "img",
    "rid": "rId74",
    "src": "media/image37.png",
    "kind": "formula"
   },
   {
    "t": "text",
    "v": "是线段"
   },
   {
    "t": "img",
    "rid": "rId76",
    "src": "media/image38.png",
    "kind": "formula"
   },
   {
    "t": "text",
    "v": "的中点，点"
   },
   {
    "t": "img",
    "rid": "rId78",
    "src": "media/image39.png",
    "kind": "formula"
   },
   {
    "t": "text",
    "v": "在线段"
   },
   {
    "t": "img",
    "rid": "rId80",
    "src": "media/image40.png",
    "kind": "formula"
   },
   {
    "t": "text",
    "v": "上，"
   },
   {
    "t": "img",
    "rid": "rId82",
    "src": "media/image41.png",
    "kind": "formula"
   },
   {
    "t": "text",
    "v": "是线段"
   },
   {
    "t": "img",
    "rid": "rId84",
    "src": "media/image42.png",
    "kind": "formula"
   },
   {
    "t": "text",
    "v": "的中点．若"
   },
   {
    "t": "img",
    "rid": "rId86",
    "src": "media/image43.png",
    "kind": "formula"
   },
   {
    "t": "text",
    "v": "，"
   },
   {
    "t": "img",
    "rid": "rId88",
    "src": "media/image44.png",
    "kind": "formula"
   },
   {
    "t": "text",
    "v": "，则"
   },
   {
    "t": "img",
    "rid": "rId90",
    "src": "media/image45.png",
    "kind": "formula"
   },
   {
    "t": "text",
    "v": "的长为"
   },
   {
    "t": "text",
    "v": "______"
   },
   {
    "t": "text",
    "v": "．"
   },
   {
    "t": "break"
   },
   {
    "t": "img",
    "rid": "rId92",
    "src": "media/image46.png",
    "kind": "figure"
   },
   {
    "t": "text",
    "v": "  "
   }
  ],
  "rawParas": [
   "13. 如图，⟨公式⟩是线段⟨公式⟩的中点，点⟨公式⟩在线段⟨公式⟩上，⟨公式⟩是线段⟨公式⟩的中点．若⟨公式⟩，⟨公式⟩，则⟨公式⟩的长为______．",
   "⟨公式⟩"
  ],
  "options": null,
  "optionParts": null,
  "key": null,
  "answer": "3",
  "accept": [
   "3"
  ],
  "officialKey": "3"
 },
 {
  "id": "p2022-q14",
  "paperId": "p2022",
  "year": "2022—2023",
  "no": 14,
  "qtype": "calc",
  "chapter": "ch-eq",
  "cat": "概念",
  "score": 2,
  "diff": "easy",
  "topic": "方程解求参数",
  "name": "方程解求参数",
  "bonus": false,
  "hasAnswer": true,
  "stemText": "若⟨公式⟩是关于⟨公式⟩的方程⟨公式⟩的解，则⟨公式⟩的值为______．",
  "stemParts": [
   {
    "t": "text",
    "v": ""
   },
   {
    "t": "text",
    "v": "若"
   },
   {
    "t": "img",
    "rid": "rId93",
    "src": "media/image47.png",
    "kind": "formula"
   },
   {
    "t": "text",
    "v": "是关于"
   },
   {
    "t": "img",
    "rid": "rId95",
    "src": "media/image48.png",
    "kind": "formula"
   },
   {
    "t": "text",
    "v": "的方程"
   },
   {
    "t": "img",
    "rid": "rId97",
    "src": "media/image49.png",
    "kind": "formula"
   },
   {
    "t": "text",
    "v": "的解，则"
   },
   {
    "t": "img",
    "rid": "rId99",
    "src": "media/image50.png",
    "kind": "formula"
   },
   {
    "t": "text",
    "v": "的值为"
   },
   {
    "t": "text",
    "v": "______"
   },
   {
    "t": "text",
    "v": "．"
   }
  ],
  "rawParas": [
   "14. 若⟨公式⟩是关于⟨公式⟩的方程⟨公式⟩的解，则⟨公式⟩的值为______．"
  ],
  "options": null,
  "optionParts": null,
  "key": null,
  "answer": "-5",
  "accept": [
   "-5"
  ],
  "officialKey": "-5"
 },
 {
  "id": "p2022-q15",
  "paperId": "p2022",
  "year": "2022—2023",
  "no": 15,
  "qtype": "calc",
  "chapter": "ch-expr",
  "cat": "建模",
  "score": 2,
  "diff": "mid",
  "topic": "列代数式",
  "name": "列代数式（两次降价）",
  "bonus": false,
  "hasAnswer": true,
  "stemText": "某商品原价是每件⟨公式⟩元，第一次降价打“九折”，第二次降价每件又减50元，则第二次降价后的售价为每件______元．（用含⟨公式⟩的式子表示）",
  "stemParts": [
   {
    "t": "text",
    "v": ""
   },
   {
    "t": "text",
    "v": "某商品原价是每件"
   },
   {
    "t": "img",
    "rid": "rId101",
    "src": "media/image51.png",
    "kind": "formula"
   },
   {
    "t": "text",
    "v": "元，第一次降价打“九折”，第二次降价每件又减"
   },
   {
    "t": "text",
    "v": "50"
   },
   {
    "t": "text",
    "v": "元，则第二次降价后的售价为每件"
   },
   {
    "t": "text",
    "v": "______"
   },
   {
    "t": "text",
    "v": "元．（用含"
   },
   {
    "t": "img",
    "rid": "rId101",
    "src": "media/image51.png",
    "kind": "formula"
   },
   {
    "t": "text",
    "v": "的式子表示）"
   }
  ],
  "rawParas": [
   "15. 某商品原价是每件⟨公式⟩元，第一次降价打“九折”，第二次降价每件又减50元，则第二次降价后的售价为每件______元．（用含⟨公式⟩的式子表示）"
  ],
  "options": null,
  "optionParts": null,
  "key": null,
  "answer": "0.9a-50",
  "accept": [
   "0.9a-50"
  ],
  "officialKey": "0.9a-50"
 },
 {
  "id": "p2022-q16",
  "paperId": "p2022",
  "year": "2022—2023",
  "no": 16,
  "qtype": "big",
  "chapter": "ch-op",
  "cat": "推理",
  "score": 2,
  "diff": "hard",
  "topic": "数字填图（幻方类）",
  "name": "数字填图（单元和为 23）",
  "bonus": false,
  "hasAnswer": false,
  "stemText": "在图所示的图案中，每个小三角形的边长都为1，把由四个小三角形组成的边长为2的大三角形称为一个“单元”．现将1，2，3，4，5，6，7，8，9，10这十个数分别填入图中的十个小三角形中，使得对于图中的四个“单元”，每个“单元”中的四个数之和都是23．若2，4，5，a已填入图中，位置如图所示，则⟨公式⟩表示的数是______；请按上述要求，将剩余的数填入图中（填出一种即可）．⟨公式⟩⟨公式⟩",
  "stemParts": [
   {
    "t": "text",
    "v": ""
   },
   {
    "t": "text",
    "v": "在图所示的图案中，每个小三角形的边长都为"
   },
   {
    "t": "text",
    "v": "1"
   },
   {
    "t": "text",
    "v": "，把由四个小三角形组成的边长为"
   },
   {
    "t": "text",
    "v": "2"
   },
   {
    "t": "text",
    "v": "的大三角形称为一个“单元”．现将"
   },
   {
    "t": "text",
    "v": "1"
   },
   {
    "t": "text",
    "v": "，"
   },
   {
    "t": "text",
    "v": "2"
   },
   {
    "t": "text",
    "v": "，"
   },
   {
    "t": "text",
    "v": "3"
   },
   {
    "t": "text",
    "v": "，"
   },
   {
    "t": "text",
    "v": "4"
   },
   {
    "t": "text",
    "v": "，"
   },
   {
    "t": "text",
    "v": "5"
   },
   {
    "t": "text",
    "v": "，"
   },
   {
    "t": "text",
    "v": "6"
   },
   {
    "t": "text",
    "v": "，"
   },
   {
    "t": "text",
    "v": "7"
   },
   {
    "t": "text",
    "v": "，"
   },
   {
    "t": "text",
    "v": "8"
   },
   {
    "t": "text",
    "v": "，"
   },
   {
    "t": "text",
    "v": "9"
   },
   {
    "t": "text",
    "v": "，"
   },
   {
    "t": "text",
    "v": "10"
   },
   {
    "t": "text",
    "v": "这十个数分别填入图中的十个小三角形中，使得对于图中的"
   },
   {
    "t": "text",
    "v": "四个"
   },
   {
    "t": "text",
    "v": "“单元”，每个“单元”中的四个数之和都是"
   },
   {
    "t": "text",
    "v": "23"
   },
   {
    "t": "text",
    "v": "．若"
   },
   {
    "t": "text",
    "v": "2"
   },
   {
    "t": "text",
    "v": "，"
   },
   {
    "t": "text",
    "v": "4"
   },
   {
    "t": "text",
    "v": "，"
   },
   {
    "t": "text",
    "v": "5"
   },
   {
    "t": "text",
    "v": "，"
   },
   {
    "t": "text",
    "v": "a"
   },
   {
    "t": "text",
    "v": "已填入图中，位置如图所示，则"
   },
   {
    "t": "img",
    "rid": "rId101",
    "src": "media/image51.png",
    "kind": "formula"
   },
   {
    "t": "text",
    "v": "表示的数是"
   },
   {
    "t": "text",
    "v": "______"
   },
   {
    "t": "text",
    "v": "；请按上述要求，将剩余的数填入图中（填出一种即可）．"
   },
   {
    "t": "break"
   },
   {
    "t": "img",
    "rid": "rId105",
    "src": "media/image52.png",
    "kind": "figure"
   }
  ],
  "rawParas": [
   "16. 在图所示的图案中，每个小三角形的边长都为1，把由四个小三角形组成的边长为2的大三角形称为一个“单元”．现将1，2，3，4，5，6，7，8，9，10这十个数分别填入图中的十个小三角形中，使得对于图中的四个“单元”，每个“单元”中的四个数之和都是23．若2，4，5，a已填入图中，位置如图所示，则⟨公式⟩表示的数是______；请按上述要求，将剩余的数填入图中（填出一种即可）．",
   "⟨公式⟩"
  ],
  "options": null,
  "optionParts": null,
  "key": null,
  "answer": null,
  "officialKey": null
 },
 {
  "id": "p2022-q17",
  "paperId": "p2022",
  "year": "2022—2023",
  "no": 17,
  "qtype": "big",
  "chapter": "ch-op",
  "cat": "计算",
  "score": 18,
  "diff": "mid",
  "topic": "有理数混合运算",
  "name": "计算和化简（4 小问）",
  "bonus": false,
  "hasAnswer": false,
  "stemText": "计算和化简：⟨公式⟩（1）⟨公式⟩；⟨公式⟩（2）⟨公式⟩；⟨公式⟩（3）⟨公式⟩；⟨公式⟩（4）⟨公式⟩．",
  "stemParts": [
   {
    "t": "text",
    "v": ""
   },
   {
    "t": "text",
    "v": "计算和化简："
   },
   {
    "t": "break"
   },
   {
    "t": "text",
    "v": "（1）"
   },
   {
    "t": "img",
    "rid": "rId106",
    "src": "media/image53.png",
    "kind": "formula"
   },
   {
    "t": "text",
    "v": "；"
   },
   {
    "t": "break"
   },
   {
    "t": "text",
    "v": "（2）"
   },
   {
    "t": "img",
    "rid": "rId108",
    "src": "media/image54.png",
    "kind": "formula"
   },
   {
    "t": "text",
    "v": "；"
   },
   {
    "t": "break"
   },
   {
    "t": "text",
    "v": "（3）"
   },
   {
    "t": "img",
    "rid": "rId110",
    "src": "media/image55.png",
    "kind": "formula"
   },
   {
    "t": "text",
    "v": "；"
   },
   {
    "t": "break"
   },
   {
    "t": "text",
    "v": "（4）"
   },
   {
    "t": "img",
    "rid": "rId112",
    "src": "media/image56.png",
    "kind": "formula"
   },
   {
    "t": "text",
    "v": "．"
   }
  ],
  "rawParas": [
   "17. 计算和化简：",
   "（1）⟨公式⟩；",
   "（2）⟨公式⟩；",
   "（3）⟨公式⟩；",
   "（4）⟨公式⟩．"
  ],
  "options": null,
  "optionParts": null,
  "key": null,
  "answer": null,
  "officialKey": null
 },
 {
  "id": "p2022-q18",
  "paperId": "p2022",
  "year": "2022—2023",
  "no": 18,
  "qtype": "big",
  "chapter": "ch-geo",
  "cat": "作图",
  "score": 6,
  "diff": "mid",
  "topic": "尺规作图与说理",
  "name": "直线作图 + 三边关系说理",
  "bonus": false,
  "hasAnswer": false,
  "stemText": "如图，已知三点⟨公式⟩，作直线⟨公式⟩．⟨公式⟩⟨公式⟩⟨公式⟩（1）用语句表述图中点⟨公式⟩与直线⟨公式⟩的关系：______；⟨公式⟩（2）用直尺和圆规完成以下作图（保留作图痕迹）：连接⟨公式⟩，在线段⟨公式⟩的延长线上作线段⟨公式⟩，使⟨公式⟩．⟨公式⟩（3）连接⟨公式⟩，比较线段⟨公式⟩与线段⟨公式⟩的长短，并将下面的推理补充完整：⟨公式⟩⟨公式⟩⟨公式⟩，⟨公式⟩，⟨公式⟩⟨公式⟩⟨公式⟩，⟨公式⟩⟨公式⟩⟨公式⟩______⟨公式⟩，（______）（填推理的依据）⟨公式⟩⟨公式⟩⟨公式⟩______⟨公式⟩．",
  "stemParts": [
   {
    "t": "text",
    "v": ""
   },
   {
    "t": "text",
    "v": "如图，已知三点"
   },
   {
    "t": "img",
    "rid": "rId114",
    "src": "media/image57.png",
    "kind": "formula"
   },
   {
    "t": "text",
    "v": "，作直线"
   },
   {
    "t": "img",
    "rid": "rId76",
    "src": "media/image38.png",
    "kind": "formula"
   },
   {
    "t": "text",
    "v": "．"
   },
   {
    "t": "break"
   },
   {
    "t": "img",
    "rid": "rId117",
    "src": "media/image58.png",
    "kind": "figure"
   },
   {
    "t": "break"
   },
   {
    "t": "text",
    "v": "（1）"
   },
   {
    "t": "text",
    "v": "用语句表述图中点"
   },
   {
    "t": "img",
    "rid": "rId74",
    "src": "media/image37.png",
    "kind": "formula"
   },
   {
    "t": "text",
    "v": "与直线"
   },
   {
    "t": "img",
    "rid": "rId76",
    "src": "media/image38.png",
    "kind": "formula"
   },
   {
    "t": "text",
    "v": "的关系："
   },
   {
    "t": "text",
    "v": "______"
   },
   {
    "t": "text",
    "v": "；"
   },
   {
    "t": "break"
   },
   {
    "t": "text",
    "v": "（2）"
   },
   {
    "t": "text",
    "v": "用直尺和圆规完成以下作图（保留作图痕迹）：连接"
   },
   {
    "t": "img",
    "rid": "rId120",
    "src": "media/image59.png",
    "kind": "formula"
   },
   {
    "t": "text",
    "v": "，在线段"
   },
   {
    "t": "img",
    "rid": "rId120",
    "src": "media/image59.png",
    "kind": "formula"
   },
   {
    "t": "text",
    "v": "的延长线上作线段"
   },
   {
    "t": "img",
    "rid": "rId123",
    "src": "media/image60.png",
    "kind": "formula"
   },
   {
    "t": "text",
    "v": "，使"
   },
   {
    "t": "img",
    "rid": "rId125",
    "src": "media/image61.png",
    "kind": "formula"
   },
   {
    "t": "text",
    "v": "．"
   },
   {
    "t": "break"
   },
   {
    "t": "text",
    "v": "（3）"
   },
   {
    "t": "text",
    "v": "连接"
   },
   {
    "t": "img",
    "rid": "rId127",
    "src": "media/image62.png",
    "kind": "formula"
   },
   {
    "t": "text",
    "v": "，比较线段"
   },
   {
    "t": "img",
    "rid": "rId129",
    "src": "media/image63.png",
    "kind": "formula"
   },
   {
    "t": "text",
    "v": "与线段"
   },
   {
    "t": "img",
    "rid": "rId127",
    "src": "media/image62.png",
    "kind": "formula"
   },
   {
    "t": "text",
    "v": "的长短，并将下面的推理补充完整："
   },
   {
    "t": "break"
   },
   {
    "t": "img",
    "rid": "rId132",
    "src": "media/image64.png",
    "kind": "formula"
   },
   {
    "t": "img",
    "rid": "rId134",
    "src": "media/image65.png",
    "kind": "formula"
   },
   {
    "t": "text",
    "v": "，"
   },
   {
    "t": "img",
    "rid": "rId125",
    "src": "media/image61.png",
    "kind": "formula"
   },
   {
    "t": "text",
    "v": "，"
   },
   {
    "t": "break"
   },
   {
    "t": "img",
    "rid": "rId137",
    "src": "media/image66.png",
    "kind": "formula"
   },
   {
    "t": "img",
    "rid": "rId139",
    "src": "media/image67.png",
    "kind": "formula"
   },
   {
    "t": "text",
    "v": "，"
   },
   {
    "t": "break"
   },
   {
    "t": "img",
    "rid": "rId132",
    "src": "media/image64.png",
    "kind": "formula"
   },
   {
    "t": "img",
    "rid": "rId142",
    "src": "media/image68.png",
    "kind": "formula"
   },
   {
    "t": "text",
    "v": "______"
   },
   {
    "t": "img",
    "rid": "rId127",
    "src": "media/image62.png",
    "kind": "formula"
   },
   {
    "t": "text",
    "v": "，（"
   },
   {
    "t": "text",
    "v": "______"
   },
   {
    "t": "text",
    "v": "）（填推理的依据）"
   },
   {
    "t": "break"
   },
   {
    "t": "img",
    "rid": "rId137",
    "src": "media/image66.png",
    "kind": "formula"
   },
   {
    "t": "img",
    "rid": "rId129",
    "src": "media/image63.png",
    "kind": "formula"
   },
   {
    "t": "text",
    "v": "______"
   },
   {
    "t": "img",
    "rid": "rId127",
    "src": "media/image62.png",
    "kind": "formula"
   },
   {
    "t": "text",
    "v": "．"
   }
  ],
  "rawParas": [
   "18. 如图，已知三点⟨公式⟩，作直线⟨公式⟩．",
   "⟨公式⟩",
   "（1）用语句表述图中点⟨公式⟩与直线⟨公式⟩的关系：______；",
   "（2）用直尺和圆规完成以下作图（保留作图痕迹）：连接⟨公式⟩，在线段⟨公式⟩的延长线上作线段⟨公式⟩，使⟨公式⟩．",
   "（3）连接⟨公式⟩，比较线段⟨公式⟩与线段⟨公式⟩的长短，并将下面的推理补充完整：",
   "⟨公式⟩⟨公式⟩，⟨公式⟩，",
   "⟨公式⟩⟨公式⟩，",
   "⟨公式⟩⟨公式⟩______⟨公式⟩，（______）（填推理的依据）",
   "⟨公式⟩⟨公式⟩______⟨公式⟩．"
  ],
  "options": null,
  "optionParts": null,
  "key": null,
  "answer": null,
  "officialKey": null
 },
 {
  "id": "p2022-q19",
  "paperId": "p2022",
  "year": "2022—2023",
  "no": 19,
  "qtype": "big",
  "chapter": "ch-poly",
  "cat": "计算",
  "score": 6,
  "diff": "mid",
  "topic": "整式化简求值",
  "name": "化简求值",
  "bonus": false,
  "hasAnswer": false,
  "stemText": "先化简，再求值：⟨公式⟩，其中⟨公式⟩，⟨公式⟩．",
  "stemParts": [
   {
    "t": "text",
    "v": ""
   },
   {
    "t": "text",
    "v": "先化简，再求值："
   },
   {
    "t": "img",
    "rid": "rId148",
    "src": "media/image69.png",
    "kind": "formula"
   },
   {
    "t": "text",
    "v": "，其中"
   },
   {
    "t": "img",
    "rid": "rId150",
    "src": "media/image70.png",
    "kind": "formula"
   },
   {
    "t": "text",
    "v": "，"
   },
   {
    "t": "img",
    "rid": "rId152",
    "src": "media/image71.png",
    "kind": "formula"
   },
   {
    "t": "text",
    "v": "．"
   }
  ],
  "rawParas": [
   "19. 先化简，再求值：⟨公式⟩，其中⟨公式⟩，⟨公式⟩．"
  ],
  "options": null,
  "optionParts": null,
  "key": null,
  "answer": null,
  "officialKey": null
 },
 {
  "id": "p2022-q20",
  "paperId": "p2022",
  "year": "2022—2023",
  "no": 20,
  "qtype": "big",
  "chapter": "ch-eq",
  "cat": "计算",
  "score": 11,
  "diff": "mid",
  "topic": "解一元一次方程",
  "name": "解方程（2 小问）",
  "bonus": false,
  "hasAnswer": false,
  "stemText": "解方程：⟨公式⟩（1）⟨公式⟩；⟨公式⟩（2）⟨公式⟩．",
  "stemParts": [
   {
    "t": "text",
    "v": ""
   },
   {
    "t": "text",
    "v": "解方程："
   },
   {
    "t": "break"
   },
   {
    "t": "text",
    "v": "（1）"
   },
   {
    "t": "img",
    "rid": "rId154",
    "src": "media/image72.png",
    "kind": "formula"
   },
   {
    "t": "text",
    "v": "；"
   },
   {
    "t": "break"
   },
   {
    "t": "text",
    "v": "（2）"
   },
   {
    "t": "img",
    "rid": "rId156",
    "src": "media/image73.png",
    "kind": "formula"
   },
   {
    "t": "text",
    "v": "．"
   }
  ],
  "rawParas": [
   "20. 解方程：",
   "（1）⟨公式⟩；",
   "（2）⟨公式⟩．"
  ],
  "options": null,
  "optionParts": null,
  "key": null,
  "answer": null,
  "officialKey": null
 },
 {
  "id": "p2022-q21",
  "paperId": "p2022",
  "year": "2022—2023",
  "no": 21,
  "qtype": "big",
  "chapter": "ch-geo",
  "cat": "推理",
  "score": 6,
  "diff": "mid",
  "topic": "角度推理与说理",
  "name": "角度推理填空（角平分线）",
  "bonus": false,
  "hasAnswer": false,
  "stemText": "如图，⟨公式⟩，⟨公式⟩．过点⟨公式⟩在⟨公式⟩的内部画射线⟨公式⟩．⟨公式⟩⟨公式⟩⟨公式⟩探究发现：⟨公式⟩（1）当⟨公式⟩时，⟨公式⟩平分⟨公式⟩．⟨公式⟩⟨公式⟩依题意补全图形；⟨公式⟩⟨公式⟩将下面的推理补充完整．⟨公式⟩证明：⟨公式⟩⟨公式⟩，⟨公式⟩⟨公式⟩⟨公式⟩______⟨公式⟩，⟨公式⟩⟨公式⟩⟨公式⟩，⟨公式⟩⟨公式⟩⟨公式⟩______⟨公式⟩，⟨公式⟩⟨公式⟩⟨公式⟩，⟨公式⟩⟨公式⟩⟨公式⟩，⟨公式⟩⟨公式⟩⟨公式⟩______⟨公式⟩（    ）．（______）（填推理的依据）⟨公式⟩⟨公式⟩⟨公式⟩平分⟨公式⟩⟨公式⟩（2）当⟨公式⟩时，射线______平分⟨公式⟩______．",
  "stemParts": [
   {
    "t": "text",
    "v": ""
   },
   {
    "t": "text",
    "v": "如图，"
   },
   {
    "t": "img",
    "rid": "rId158",
    "src": "media/image74.png",
    "kind": "formula"
   },
   {
    "t": "text",
    "v": "，"
   },
   {
    "t": "img",
    "rid": "rId160",
    "src": "media/image75.png",
    "kind": "formula"
   },
   {
    "t": "text",
    "v": "．过点"
   },
   {
    "t": "img",
    "rid": "rId162",
    "src": "media/image76.png",
    "kind": "formula"
   },
   {
    "t": "text",
    "v": "在"
   },
   {
    "t": "img",
    "rid": "rId164",
    "src": "media/image77.png",
    "kind": "formula"
   },
   {
    "t": "text",
    "v": "的内部画射线"
   },
   {
    "t": "img",
    "rid": "rId166",
    "src": "media/image78.png",
    "kind": "formula"
   },
   {
    "t": "text",
    "v": "．"
   },
   {
    "t": "break"
   },
   {
    "t": "img",
    "rid": "rId168",
    "src": "media/image79.png",
    "kind": "figure"
   },
   {
    "t": "break"
   },
   {
    "t": "text",
    "v": "探究发现："
   },
   {
    "t": "break"
   },
   {
    "t": "text",
    "v": "（1）"
   },
   {
    "t": "text",
    "v": "当"
   },
   {
    "t": "img",
    "rid": "rId169",
    "src": "media/image80.png",
    "kind": "formula"
   },
   {
    "t": "text",
    "v": "时，"
   },
   {
    "t": "img",
    "rid": "rId171",
    "src": "media/image81.png",
    "kind": "formula"
   },
   {
    "t": "text",
    "v": "平分"
   },
   {
    "t": "img",
    "rid": "rId173",
    "src": "media/image82.png",
    "kind": "formula"
   },
   {
    "t": "text",
    "v": "．"
   },
   {
    "t": "break"
   },
   {
    "t": "img",
    "rid": "rId175",
    "src": "media/image83.png",
    "kind": "formula"
   },
   {
    "t": "text",
    "v": "依题意补全图形；"
   },
   {
    "t": "break"
   },
   {
    "t": "img",
    "rid": "rId177",
    "src": "media/image84.png",
    "kind": "formula"
   },
   {
    "t": "text",
    "v": "将下面的推理补充完整．"
   },
   {
    "t": "break"
   },
   {
    "t": "text",
    "v": "证明："
   },
   {
    "t": "img",
    "rid": "rId132",
    "src": "media/image64.png",
    "kind": "formula"
   },
   {
    "t": "img",
    "rid": "rId169",
    "src": "media/image80.png",
    "kind": "formula"
   },
   {
    "t": "text",
    "v": "，"
   },
   {
    "t": "break"
   },
   {
    "t": "img",
    "rid": "rId137",
    "src": "media/image66.png",
    "kind": "formula"
   },
   {
    "t": "img",
    "rid": "rId182",
    "src": "media/image85.png",
    "kind": "formula"
   },
   {
    "t": "text",
    "v": "______"
   },
   {
    "t": "img",
    "rid": "rId184",
    "src": "media/image86.png",
    "kind": "formula"
   },
   {
    "t": "text",
    "v": "，"
   },
   {
    "t": "break"
   },
   {
    "t": "img",
    "rid": "rId132",
    "src": "media/image64.png",
    "kind": "formula"
   },
   {
    "t": "img",
    "rid": "rId158",
    "src": "media/image74.png",
    "kind": "formula"
   },
   {
    "t": "text",
    "v": "，"
   },
   {
    "t": "break"
   },
   {
    "t": "img",
    "rid": "rId137",
    "src": "media/image66.png",
    "kind": "formula"
   },
   {
    "t": "img",
    "rid": "rId182",
    "src": "media/image85.png",
    "kind": "formula"
   },
   {
    "t": "text",
    "v": "______"
   },
   {
    "t": "img",
    "rid": "rId184",
    "src": "media/image86.png",
    "kind": "formula"
   },
   {
    "t": "text",
    "v": "，"
   },
   {
    "t": "break"
   },
   {
    "t": "img",
    "rid": "rId132",
    "src": "media/image64.png",
    "kind": "formula"
   },
   {
    "t": "img",
    "rid": "rId160",
    "src": "media/image75.png",
    "kind": "formula"
   },
   {
    "t": "text",
    "v": "，"
   },
   {
    "t": "break"
   },
   {
    "t": "img",
    "rid": "rId137",
    "src": "media/image66.png",
    "kind": "formula"
   },
   {
    "t": "img",
    "rid": "rId194",
    "src": "media/image87.png",
    "kind": "formula"
   },
   {
    "t": "text",
    "v": "，"
   },
   {
    "t": "break"
   },
   {
    "t": "img",
    "rid": "rId137",
    "src": "media/image66.png",
    "kind": "formula"
   },
   {
    "t": "img",
    "rid": "rId197",
    "src": "media/image88.png",
    "kind": "formula"
   },
   {
    "t": "text",
    "v": "______"
   },
   {
    "t": "img",
    "rid": "rId199",
    "src": "media/image89.png",
    "kind": "formula"
   },
   {
    "t": "text",
    "v": "（"
   },
   {
    "t": "text",
    "v": "    "
   },
   {
    "t": "text",
    "v": "）．（"
   },
   {
    "t": "text",
    "v": "______"
   },
   {
    "t": "text",
    "v": "）（填推理的依据）"
   },
   {
    "t": "break"
   },
   {
    "t": "img",
    "rid": "rId137",
    "src": "media/image66.png",
    "kind": "formula"
   },
   {
    "t": "img",
    "rid": "rId171",
    "src": "media/image81.png",
    "kind": "formula"
   },
   {
    "t": "text",
    "v": "平分"
   },
   {
    "t": "img",
    "rid": "rId173",
    "src": "media/image82.png",
    "kind": "formula"
   },
   {
    "t": "break"
   },
   {
    "t": "text",
    "v": "（2）"
   },
   {
    "t": "text",
    "v": "当"
   },
   {
    "t": "img",
    "rid": "rId204",
    "src": "media/image90.png",
    "kind": "formula"
   },
   {
    "t": "text",
    "v": "时，射线"
   },
   {
    "t": "text",
    "v": "______"
   },
   {
    "t": "text",
    "v": "平分"
   },
   {
    "t": "img",
    "rid": "rId197",
    "src": "media/image88.png",
    "kind": "formula"
   },
   {
    "t": "text",
    "v": "______"
   },
   {
    "t": "text",
    "v": "．"
   }
  ],
  "rawParas": [
   "21. 如图，⟨公式⟩，⟨公式⟩．过点⟨公式⟩在⟨公式⟩的内部画射线⟨公式⟩．",
   "⟨公式⟩",
   "探究发现：",
   "（1）当⟨公式⟩时，⟨公式⟩平分⟨公式⟩．",
   "⟨公式⟩依题意补全图形；",
   "⟨公式⟩将下面的推理补充完整．",
   "证明：⟨公式⟩⟨公式⟩，",
   "⟨公式⟩⟨公式⟩______⟨公式⟩，",
   "⟨公式⟩⟨公式⟩，",
   "⟨公式⟩⟨公式⟩______⟨公式⟩，",
   "⟨公式⟩⟨公式⟩，",
   "⟨公式⟩⟨公式⟩，",
   "⟨公式⟩⟨公式⟩______⟨公式⟩（    ）．（______）（填推理的依据）",
   "⟨公式⟩⟨公式⟩平分⟨公式⟩",
   "（2）当⟨公式⟩时，射线______平分⟨公式⟩______．"
  ],
  "options": null,
  "optionParts": null,
  "key": null,
  "answer": null,
  "officialKey": null
 },
 {
  "id": "p2022-q22",
  "paperId": "p2022",
  "year": "2022—2023",
  "no": 22,
  "qtype": "big",
  "chapter": "ch-eq",
  "cat": "建模",
  "score": 7,
  "diff": "mid",
  "topic": "方程应用（配套/分配）",
  "name": "方程应用题（两机型，两种方法）",
  "bonus": false,
  "hasAnswer": false,
  "stemText": "用⟨公式⟩两种型号的机器生产相同的产品，产品装入同样规格的包装箱后运往仓库．已知每台⟨公式⟩型机器比⟨公式⟩型机器一天多生产2件产品，3台⟨公式⟩型机器一天生产的产品恰好能装满5箱，4台⟨公式⟩型机器一天生产的产品恰好能装满7箱．每台⟨公式⟩型机器一天生产多少件产品？每箱装多少件产品？⟨公式⟩下面是解决该问题的两种方法，请选择其中的一种方法完成分析和解答．⟨公式⟩方法一⟨公式⟩分析：设每台⟨公式⟩型机器一天生产⟨公式⟩件产品，则每台⟨公式⟩型机器一天生产⟨公式⟩件产品，3台⟨公式⟩型机器一天共生产______件产品，4台⟨公式⟩型机器一天共生产______件产品，再根据题意列方程．⟨公式⟩解：设每台⟨公式⟩型机器一天生产⟨公式⟩件产品．⟨公式⟩答：⟨公式⟩方法二⟨公式⟩分析：设每箱装⟨公式⟩件产品，则3台⟨公式⟩型机器一天共生产______件产品，4台⟨公式⟩型机器一天共生产______件产品，再根据题意列方程．⟨公式⟩解：设每箱装⟨公式⟩件产品．⟨公式⟩答：",
  "stemParts": [
   {
    "t": "text",
    "v": ""
   },
   {
    "t": "text",
    "v": "用"
   },
   {
    "t": "img",
    "rid": "rId207",
    "src": "media/image91.png",
    "kind": "formula"
   },
   {
    "t": "text",
    "v": "两种型号的机器生产相同的产品，产品装入同样规格的包装箱后运往仓库．已知每台"
   },
   {
    "t": "img",
    "rid": "rId209",
    "src": "media/image92.png",
    "kind": "formula"
   },
   {
    "t": "text",
    "v": "型机器比"
   },
   {
    "t": "img",
    "rid": "rId211",
    "src": "media/image93.png",
    "kind": "formula"
   },
   {
    "t": "text",
    "v": "型机器一天多生产"
   },
   {
    "t": "text",
    "v": "2"
   },
   {
    "t": "text",
    "v": "件产品，"
   },
   {
    "t": "text",
    "v": "3"
   },
   {
    "t": "text",
    "v": "台"
   },
   {
    "t": "img",
    "rid": "rId211",
    "src": "media/image93.png",
    "kind": "formula"
   },
   {
    "t": "text",
    "v": "型机器一天生产的产品恰好能装满"
   },
   {
    "t": "text",
    "v": "5"
   },
   {
    "t": "text",
    "v": "箱，"
   },
   {
    "t": "text",
    "v": "4"
   },
   {
    "t": "text",
    "v": "台"
   },
   {
    "t": "img",
    "rid": "rId209",
    "src": "media/image92.png",
    "kind": "formula"
   },
   {
    "t": "text",
    "v": "型机器一天生产的产品恰好能装满"
   },
   {
    "t": "text",
    "v": "7"
   },
   {
    "t": "text",
    "v": "箱．每台"
   },
   {
    "t": "img",
    "rid": "rId211",
    "src": "media/image93.png",
    "kind": "formula"
   },
   {
    "t": "text",
    "v": "型机器一天生产多少件产品？每箱装多少件产品？"
   },
   {
    "t": "break"
   },
   {
    "t": "text",
    "v": "下面是解决该问题的两种方法，请"
   },
   {
    "t": "text",
    "v": "选择其中的一种"
   },
   {
    "t": "text",
    "v": "方法完成分析和解答．"
   },
   {
    "t": "break"
   },
   {
    "t": "text",
    "v": "方法一"
   },
   {
    "t": "break"
   },
   {
    "t": "text",
    "v": "分析：设每台"
   },
   {
    "t": "img",
    "rid": "rId211",
    "src": "media/image93.png",
    "kind": "formula"
   },
   {
    "t": "text",
    "v": "型机器一天生产"
   },
   {
    "t": "img",
    "rid": "rId95",
    "src": "media/image48.png",
    "kind": "formula"
   },
   {
    "t": "text",
    "v": "件产品，则每台"
   },
   {
    "t": "img",
    "rid": "rId209",
    "src": "media/image92.png",
    "kind": "formula"
   },
   {
    "t": "text",
    "v": "型机器一天生产"
   },
   {
    "t": "img",
    "rid": "rId219",
    "src": "media/image94.png",
    "kind": "formula"
   },
   {
    "t": "text",
    "v": "件产品，"
   },
   {
    "t": "text",
    "v": "3"
   },
   {
    "t": "text",
    "v": "台"
   },
   {
    "t": "img",
    "rid": "rId211",
    "src": "media/image93.png",
    "kind": "formula"
   },
   {
    "t": "text",
    "v": "型机器一天共生产"
   },
   {
    "t": "text",
    "v": "______"
   },
   {
    "t": "text",
    "v": "件产品，"
   },
   {
    "t": "text",
    "v": "4"
   },
   {
    "t": "text",
    "v": "台"
   },
   {
    "t": "img",
    "rid": "rId209",
    "src": "media/image92.png",
    "kind": "formula"
   },
   {
    "t": "text",
    "v": "型机器一天共生产"
   },
   {
    "t": "text",
    "v": "______"
   },
   {
    "t": "text",
    "v": "件产品，再根据题意列方程．"
   },
   {
    "t": "break"
   },
   {
    "t": "text",
    "v": "解：设每台"
   },
   {
    "t": "img",
    "rid": "rId211",
    "src": "media/image93.png",
    "kind": "formula"
   },
   {
    "t": "text",
    "v": "型机器一天生产"
   },
   {
    "t": "img",
    "rid": "rId95",
    "src": "media/image48.png",
    "kind": "formula"
   },
   {
    "t": "text",
    "v": "件产品．"
   },
   {
    "t": "break"
   },
   {
    "t": "text",
    "v": "答："
   },
   {
    "t": "break"
   },
   {
    "t": "text",
    "v": "方法二"
   },
   {
    "t": "break"
   },
   {
    "t": "text",
    "v": "分析：设每箱装"
   },
   {
    "t": "img",
    "rid": "rId95",
    "src": "media/image48.png",
    "kind": "formula"
   },
   {
    "t": "text",
    "v": "件产品，则"
   },
   {
    "t": "text",
    "v": "3"
   },
   {
    "t": "text",
    "v": "台"
   },
   {
    "t": "img",
    "rid": "rId211",
    "src": "media/image93.png",
    "kind": "formula"
   },
   {
    "t": "text",
    "v": "型机器一天共生产"
   },
   {
    "t": "text",
    "v": "______"
   },
   {
    "t": "text",
    "v": "件产品，"
   },
   {
    "t": "text",
    "v": "4"
   },
   {
    "t": "text",
    "v": "台"
   },
   {
    "t": "img",
    "rid": "rId209",
    "src": "media/image92.png",
    "kind": "formula"
   },
   {
    "t": "text",
    "v": "型机器一天共生产"
   },
   {
    "t": "text",
    "v": "______"
   },
   {
    "t": "text",
    "v": "件产品，再根据题意列方程．"
   },
   {
    "t": "break"
   },
   {
    "t": "text",
    "v": "解：设每箱装"
   },
   {
    "t": "img",
    "rid": "rId95",
    "src": "media/image48.png",
    "kind": "formula"
   },
   {
    "t": "text",
    "v": "件产品．"
   },
   {
    "t": "break"
   },
   {
    "t": "text",
    "v": "答："
   }
  ],
  "rawParas": [
   "22. 用⟨公式⟩两种型号的机器生产相同的产品，产品装入同样规格的包装箱后运往仓库．已知每台⟨公式⟩型机器比⟨公式⟩型机器一天多生产2件产品，3台⟨公式⟩型机器一天生产的产品恰好能装满5箱，4台⟨公式⟩型机器一天生产的产品恰好能装满7箱．每台⟨公式⟩型机器一天生产多少件产品？每箱装多少件产品？",
   "下面是解决该问题的两种方法，请选择其中的一种方法完成分析和解答．",
   "方法一",
   "分析：设每台⟨公式⟩型机器一天生产⟨公式⟩件产品，则每台⟨公式⟩型机器一天生产⟨公式⟩件产品，3台⟨公式⟩型机器一天共生产______件产品，4台⟨公式⟩型机器一天共生产______件产品，再根据题意列方程．",
   "解：设每台⟨公式⟩型机器一天生产⟨公式⟩件产品．",
   "答：",
   "方法二",
   "分析：设每箱装⟨公式⟩件产品，则3台⟨公式⟩型机器一天共生产______件产品，4台⟨公式⟩型机器一天共生产______件产品，再根据题意列方程．",
   "解：设每箱装⟨公式⟩件产品．",
   "答："
  ],
  "options": null,
  "optionParts": null,
  "key": null,
  "answer": null,
  "officialKey": null
 },
 {
  "id": "p2022-q23",
  "paperId": "p2022",
  "year": "2022—2023",
  "no": 23,
  "qtype": "big",
  "chapter": "ch-geo",
  "cat": "分类",
  "score": 7,
  "diff": "top",
  "topic": "动射线（含参）",
  "name": "动射线角度（含参 n）",
  "bonus": false,
  "hasAnswer": false,
  "stemText": "已知⟨公式⟩，射线⟨公式⟩在⟨公式⟩的内部，且⟨公式⟩．射线⟨公式⟩是平面上绕点O旋转的一条动射线，⟨公式⟩平分⟨公式⟩．⟨公式⟩⟨公式⟩⟨公式⟩（1）如图1，射线⟨公式⟩在⟨公式⟩的内部．⟨公式⟩  ①⟨公式⟩的度数为       °；⟨公式⟩  ②若⟨公式⟩与⟨公式⟩互余，求⟨公式⟩的度数；⟨公式⟩（2）若⟨公式⟩，求⟨公式⟩的度数（用含n的式子表示）．",
  "stemParts": [
   {
    "t": "text",
    "v": ""
   },
   {
    "t": "text",
    "v": "已知"
   },
   {
    "t": "img",
    "rid": "rId229",
    "src": "media/image95.png",
    "kind": "formula"
   },
   {
    "t": "text",
    "v": "，射线"
   },
   {
    "t": "img",
    "rid": "rId231",
    "src": "media/image96.png",
    "kind": "formula"
   },
   {
    "t": "text",
    "v": "在"
   },
   {
    "t": "img",
    "rid": "rId233",
    "src": "media/image97.png",
    "kind": "formula"
   },
   {
    "t": "text",
    "v": "的内部，且"
   },
   {
    "t": "img",
    "rid": "rId235",
    "src": "media/image98.png",
    "kind": "formula"
   },
   {
    "t": "text",
    "v": "．射线"
   },
   {
    "t": "img",
    "rid": "rId237",
    "src": "media/image99.png",
    "kind": "formula"
   },
   {
    "t": "text",
    "v": "是平面上绕点"
   },
   {
    "t": "text",
    "v": "O"
   },
   {
    "t": "text",
    "v": "旋转的一条动射线，"
   },
   {
    "t": "img",
    "rid": "rId166",
    "src": "media/image78.png",
    "kind": "formula"
   },
   {
    "t": "text",
    "v": "平分"
   },
   {
    "t": "img",
    "rid": "rId240",
    "src": "media/image100.png",
    "kind": "formula"
   },
   {
    "t": "text",
    "v": "．"
   },
   {
    "t": "break"
   },
   {
    "t": "img",
    "rid": "rId242",
    "src": "media/image101.png",
    "kind": "figure"
   },
   {
    "t": "break"
   },
   {
    "t": "text",
    "v": "（1）"
   },
   {
    "t": "text",
    "v": "如图"
   },
   {
    "t": "text",
    "v": "1"
   },
   {
    "t": "text",
    "v": "，射线"
   },
   {
    "t": "img",
    "rid": "rId237",
    "src": "media/image99.png",
    "kind": "formula"
   },
   {
    "t": "text",
    "v": "在"
   },
   {
    "t": "img",
    "rid": "rId164",
    "src": "media/image77.png",
    "kind": "formula"
   },
   {
    "t": "text",
    "v": "的内部．"
   },
   {
    "t": "break"
   },
   {
    "t": "text",
    "v": "  "
   },
   {
    "t": "text",
    "v": "①"
   },
   {
    "t": "img",
    "rid": "rId245",
    "src": "media/image102.png",
    "kind": "formula"
   },
   {
    "t": "text",
    "v": "的度数为"
   },
   {
    "t": "text",
    "v": "       "
   },
   {
    "t": "text",
    "v": "°"
   },
   {
    "t": "text",
    "v": "；"
   },
   {
    "t": "break"
   },
   {
    "t": "text",
    "v": "  "
   },
   {
    "t": "text",
    "v": "②若"
   },
   {
    "t": "img",
    "rid": "rId247",
    "src": "media/image103.png",
    "kind": "formula"
   },
   {
    "t": "text",
    "v": "与"
   },
   {
    "t": "img",
    "rid": "rId249",
    "src": "media/image104.png",
    "kind": "formula"
   },
   {
    "t": "text",
    "v": "互余，求"
   },
   {
    "t": "img",
    "rid": "rId247",
    "src": "media/image103.png",
    "kind": "formula"
   },
   {
    "t": "text",
    "v": "的度数；"
   },
   {
    "t": "break"
   },
   {
    "t": "text",
    "v": "（2）"
   },
   {
    "t": "text",
    "v": "若"
   },
   {
    "t": "img",
    "rid": "rId252",
    "src": "media/image105.png",
    "kind": "formula"
   },
   {
    "t": "text",
    "v": "，求"
   },
   {
    "t": "img",
    "rid": "rId254",
    "src": "media/image106.png",
    "kind": "formula"
   },
   {
    "t": "text",
    "v": "的度数（用含"
   },
   {
    "t": "text",
    "v": "n"
   },
   {
    "t": "text",
    "v": "的式子表示）．"
   }
  ],
  "rawParas": [
   "23. 已知⟨公式⟩，射线⟨公式⟩在⟨公式⟩的内部，且⟨公式⟩．射线⟨公式⟩是平面上绕点O旋转的一条动射线，⟨公式⟩平分⟨公式⟩．",
   "⟨公式⟩",
   "（1）如图1，射线⟨公式⟩在⟨公式⟩的内部．",
   "①⟨公式⟩的度数为       °；",
   "②若⟨公式⟩与⟨公式⟩互余，求⟨公式⟩的度数；",
   "（2）若⟨公式⟩，求⟨公式⟩的度数（用含n的式子表示）．"
  ],
  "options": null,
  "optionParts": null,
  "key": null,
  "answer": null,
  "officialKey": null
 },
 {
  "id": "p2022-q24",
  "paperId": "p2022",
  "year": "2022—2023",
  "no": 24,
  "qtype": "big",
  "chapter": "ch-rational",
  "cat": "新定义",
  "score": 7,
  "diff": "top",
  "topic": "新定义（数轴类）",
  "name": "新定义「k 倍分点」",
  "bonus": false,
  "hasAnswer": false,
  "stemText": "对于数轴上不同的三个点M，N，P，若满足⟨公式⟩，则称点P是点M关于点N的“k倍分点”．例如，如图，在数轴上，点M，N表示的数分别是⟨公式⟩，1，可知原点O是点M关于点N的“2倍分点”，原点O也是点N关于点M的“⟨公式⟩倍分点”．⟨公式⟩⟨公式⟩⟨公式⟩在数轴上，已知点A表示的数是⟨公式⟩，点B表示的数是2．⟨公式⟩（1）若点C在线段⟨公式⟩上，且点C是点A关于点B的“5倍分点”，则点C表示的数是______；⟨公式⟩（2）若点D在数轴上，⟨公式⟩，且点D是点B关于点A的“k倍分点”，求k的值；⟨公式⟩（3）点E从点B出发，以每秒3个单位长度的速度沿数轴正方向运动．当点E运动t秒时，在A，B，E三个点中，恰有一个点是另一个点关于第三个点的“⟨公式⟩倍分点”，直接写出t的值．",
  "stemParts": [
   {
    "t": "text",
    "v": ""
   },
   {
    "t": "text",
    "v": "对于数轴上不同的三个点"
   },
   {
    "t": "text",
    "v": "M"
   },
   {
    "t": "text",
    "v": "，"
   },
   {
    "t": "text",
    "v": "N"
   },
   {
    "t": "text",
    "v": "，"
   },
   {
    "t": "text",
    "v": "P"
   },
   {
    "t": "text",
    "v": "，若满足"
   },
   {
    "t": "img",
    "rid": "rId256",
    "src": "media/image107.png",
    "kind": "formula"
   },
   {
    "t": "text",
    "v": "，则称点"
   },
   {
    "t": "text",
    "v": "P"
   },
   {
    "t": "text",
    "v": "是点"
   },
   {
    "t": "text",
    "v": "M"
   },
   {
    "t": "text",
    "v": "关于点"
   },
   {
    "t": "text",
    "v": "N"
   },
   {
    "t": "text",
    "v": "的“"
   },
   {
    "t": "text",
    "v": "k"
   },
   {
    "t": "text",
    "v": "倍分点”．例如，如图，在数轴上，点"
   },
   {
    "t": "text",
    "v": "M"
   },
   {
    "t": "text",
    "v": "，"
   },
   {
    "t": "text",
    "v": "N"
   },
   {
    "t": "text",
    "v": "表示的数分别是"
   },
   {
    "t": "img",
    "rid": "rId60",
    "src": "media/image30.png",
    "kind": "formula"
   },
   {
    "t": "text",
    "v": "，"
   },
   {
    "t": "text",
    "v": "1"
   },
   {
    "t": "text",
    "v": "，可知原点"
   },
   {
    "t": "text",
    "v": "O"
   },
   {
    "t": "text",
    "v": "是点"
   },
   {
    "t": "text",
    "v": "M"
   },
   {
    "t": "text",
    "v": "关于点"
   },
   {
    "t": "text",
    "v": "N"
   },
   {
    "t": "text",
    "v": "的“"
   },
   {
    "t": "text",
    "v": "2"
   },
   {
    "t": "text",
    "v": "倍分点”，原点"
   },
   {
    "t": "text",
    "v": "O"
   },
   {
    "t": "text",
    "v": "也是点"
   },
   {
    "t": "text",
    "v": "N"
   },
   {
    "t": "text",
    "v": "关于点"
   },
   {
    "t": "text",
    "v": "M"
   },
   {
    "t": "text",
    "v": "的“"
   },
   {
    "t": "img",
    "rid": "rId259",
    "src": "media/image108.png",
    "kind": "formula"
   },
   {
    "t": "text",
    "v": "倍分点”．"
   },
   {
    "t": "break"
   },
   {
    "t": "img",
    "rid": "rId261",
    "src": "media/image109.png",
    "kind": "figure"
   },
   {
    "t": "break"
   },
   {
    "t": "text",
    "v": "在数轴上，已知点"
   },
   {
    "t": "text",
    "v": "A"
   },
   {
    "t": "text",
    "v": "表示的数是"
   },
   {
    "t": "img",
    "rid": "rId262",
    "src": "media/image110.png",
    "kind": "formula"
   },
   {
    "t": "text",
    "v": "，点"
   },
   {
    "t": "text",
    "v": "B"
   },
   {
    "t": "text",
    "v": "表示的数是"
   },
   {
    "t": "text",
    "v": "2"
   },
   {
    "t": "text",
    "v": "．"
   },
   {
    "t": "break"
   },
   {
    "t": "text",
    "v": "（1）"
   },
   {
    "t": "text",
    "v": "若点"
   },
   {
    "t": "text",
    "v": "C"
   },
   {
    "t": "text",
    "v": "在线段"
   },
   {
    "t": "img",
    "rid": "rId76",
    "src": "media/image38.png",
    "kind": "formula"
   },
   {
    "t": "text",
    "v": "上，且点"
   },
   {
    "t": "text",
    "v": "C"
   },
   {
    "t": "text",
    "v": "是点"
   },
   {
    "t": "text",
    "v": "A"
   },
   {
    "t": "text",
    "v": "关于点"
   },
   {
    "t": "text",
    "v": "B"
   },
   {
    "t": "text",
    "v": "的“"
   },
   {
    "t": "text",
    "v": "5"
   },
   {
    "t": "text",
    "v": "倍分点”，则点"
   },
   {
    "t": "text",
    "v": "C"
   },
   {
    "t": "text",
    "v": "表示的数是"
   },
   {
    "t": "text",
    "v": "______"
   },
   {
    "t": "text",
    "v": "；"
   },
   {
    "t": "break"
   },
   {
    "t": "text",
    "v": "（2）"
   },
   {
    "t": "text",
    "v": "若点"
   },
   {
    "t": "text",
    "v": "D"
   },
   {
    "t": "text",
    "v": "在数轴上，"
   },
   {
    "t": "img",
    "rid": "rId265",
    "src": "media/image111.png",
    "kind": "formula"
   },
   {
    "t": "text",
    "v": "，且点"
   },
   {
    "t": "text",
    "v": "D"
   },
   {
    "t": "text",
    "v": "是点"
   },
   {
    "t": "text",
    "v": "B"
   },
   {
    "t": "text",
    "v": "关于点"
   },
   {
    "t": "text",
    "v": "A"
   },
   {
    "t": "text",
    "v": "的“"
   },
   {
    "t": "text",
    "v": "k"
   },
   {
    "t": "text",
    "v": "倍分点”，求"
   },
   {
    "t": "text",
    "v": "k"
   },
   {
    "t": "text",
    "v": "的值；"
   },
   {
    "t": "break"
   },
   {
    "t": "text",
    "v": "（3）"
   },
   {
    "t": "text",
    "v": "点"
   },
   {
    "t": "text",
    "v": "E"
   },
   {
    "t": "text",
    "v": "从点"
   },
   {
    "t": "text",
    "v": "B"
   },
   {
    "t": "text",
    "v": "出发，以每秒"
   },
   {
    "t": "text",
    "v": "3"
   },
   {
    "t": "text",
    "v": "个单位长度的速度沿数轴正方向运动．当点"
   },
   {
    "t": "text",
    "v": "E"
   },
   {
    "t": "text",
    "v": "运动"
   },
   {
    "t": "text",
    "v": "t"
   },
   {
    "t": "text",
    "v": "秒时，在"
   },
   {
    "t": "text",
    "v": "A"
   },
   {
    "t": "text",
    "v": "，"
   },
   {
    "t": "text",
    "v": "B"
   },
   {
    "t": "text",
    "v": "，"
   },
   {
    "t": "text",
    "v": "E"
   },
   {
    "t": "text",
    "v": "三个点中，恰有一个点是另一个点关于第三个点的“"
   },
   {
    "t": "img",
    "rid": "rId267",
    "src": "media/image112.png",
    "kind": "formula"
   },
   {
    "t": "text",
    "v": "倍分点”，直接写出"
   },
   {
    "t": "text",
    "v": "t"
   },
   {
    "t": "text",
    "v": "的值．"
   }
  ],
  "rawParas": [
   "24. 对于数轴上不同的三个点M，N，P，若满足⟨公式⟩，则称点P是点M关于点N的“k倍分点”．例如，如图，在数轴上，点M，N表示的数分别是⟨公式⟩，1，可知原点O是点M关于点N的“2倍分点”，原点O也是点N关于点M的“⟨公式⟩倍分点”．",
   "⟨公式⟩",
   "在数轴上，已知点A表示的数是⟨公式⟩，点B表示的数是2．",
   "（1）若点C在线段⟨公式⟩上，且点C是点A关于点B的“5倍分点”，则点C表示的数是______；",
   "（2）若点D在数轴上，⟨公式⟩，且点D是点B关于点A的“k倍分点”，求k的值；",
   "（3）点E从点B出发，以每秒3个单位长度的速度沿数轴正方向运动．当点E运动t秒时，在A，B，E三个点中，恰有一个点是另一个点关于第三个点的“⟨公式⟩倍分点”，直接写出t的值．"
  ],
  "options": null,
  "optionParts": null,
  "key": null,
  "answer": null,
  "officialKey": null
 },
 {
  "id": "p2022-q25",
  "paperId": "p2022",
  "year": "2022—2023",
  "no": 25,
  "qtype": "big",
  "chapter": "ch-op",
  "cat": "新定义",
  "score": 4,
  "diff": "hard",
  "topic": "新定义（运算类）",
  "name": "新定义「乘减法」",
  "bonus": true,
  "hasAnswer": false,
  "stemText": "小东对有理数⟨公式⟩定义了一种新的运算，叫做“乘减法”，记作“⟨公式⟩”．他写出了一些按照“乘减法”运算的算式：⟨公式⟩，⟨公式⟩，⟨公式⟩，⟨公式⟩，⟨公式⟩，⟨公式⟩，⟨公式⟩，⟨公式⟩，⟨公式⟩，⟨公式⟩．⟨公式⟩小玲看了这些算式后说：“我明白你定义的乘减法法则了．”她将法则整理出来给小东看，小东说：“你的理解完全正确．”⟨公式⟩（1）请将下面小玲整理的“乘减法”法则补充完整：⟨公式⟩绝对值不相等的两数相“乘减”，同号得______，异号得______，并______；绝对值相等的两数相“乘减”，都得0；一个数与0相“乘减”，或0与一个数相“乘减”，都得这个数的绝对值．⟨公式⟩（2）若括号的作用与它在有理数运算中的作用相同，⟨公式⟩⟨公式⟩用“乘减法”计算：⟨公式⟩______．⟨公式⟩⟨公式⟩小东发现交换律在有理数的“乘减法”中仍然成立，即⟨公式⟩．但是结合律在有理数的“乘减法”中不一定成立，请你举一个例子说明⟨公式⟩不成立．",
  "stemParts": [
   {
    "t": "text",
    "v": ""
   },
   {
    "t": "text",
    "v": "小东对有理数"
   },
   {
    "t": "img",
    "rid": "rId26",
    "src": "media/image13.png",
    "kind": "formula"
   },
   {
    "t": "text",
    "v": "定义了一种新的运算，叫做"
   },
   {
    "t": "text",
    "v": "“"
   },
   {
    "t": "text",
    "v": "乘减法"
   },
   {
    "t": "text",
    "v": "”"
   },
   {
    "t": "text",
    "v": "，记作“"
   },
   {
    "t": "img",
    "rid": "rId270",
    "src": "media/image113.png",
    "kind": "formula"
   },
   {
    "t": "text",
    "v": "”．他写出了一些按照“乘减法”运算的算式："
   },
   {
    "t": "img",
    "rid": "rId272",
    "src": "media/image114.png",
    "kind": "formula"
   },
   {
    "t": "text",
    "v": "，"
   },
   {
    "t": "img",
    "rid": "rId274",
    "src": "media/image115.png",
    "kind": "formula"
   },
   {
    "t": "text",
    "v": "，"
   },
   {
    "t": "img",
    "rid": "rId276",
    "src": "media/image116.png",
    "kind": "formula"
   },
   {
    "t": "text",
    "v": "，"
   },
   {
    "t": "img",
    "rid": "rId278",
    "src": "media/image117.png",
    "kind": "formula"
   },
   {
    "t": "text",
    "v": "，"
   },
   {
    "t": "img",
    "rid": "rId280",
    "src": "media/image118.png",
    "kind": "formula"
   },
   {
    "t": "text",
    "v": "，"
   },
   {
    "t": "img",
    "rid": "rId282",
    "src": "media/image119.png",
    "kind": "formula"
   },
   {
    "t": "text",
    "v": "，"
   },
   {
    "t": "img",
    "rid": "rId284",
    "src": "media/image120.png",
    "kind": "formula"
   },
   {
    "t": "text",
    "v": "，"
   },
   {
    "t": "img",
    "rid": "rId286",
    "src": "media/image121.png",
    "kind": "formula"
   },
   {
    "t": "text",
    "v": "，"
   },
   {
    "t": "img",
    "rid": "rId288",
    "src": "media/image122.png",
    "kind": "formula"
   },
   {
    "t": "text",
    "v": "，"
   },
   {
    "t": "img",
    "rid": "rId290",
    "src": "media/image123.png",
    "kind": "formula"
   },
   {
    "t": "text",
    "v": "．"
   },
   {
    "t": "break"
   },
   {
    "t": "text",
    "v": "小玲看了这些算式后说：“我明白你定义的乘减法法则了．”她将法则整理出来给小东看，小东说：“你的理解完全正确．”"
   },
   {
    "t": "break"
   },
   {
    "t": "text",
    "v": "（1）"
   },
   {
    "t": "text",
    "v": "请将下面小玲整理的“乘减法”法则补充完整："
   },
   {
    "t": "break"
   },
   {
    "t": "text",
    "v": "绝对值不相等的两数相“乘减”，同号得"
   },
   {
    "t": "text",
    "v": "______"
   },
   {
    "t": "text",
    "v": "，异号得"
   },
   {
    "t": "text",
    "v": "______"
   },
   {
    "t": "text",
    "v": "，并"
   },
   {
    "t": "text",
    "v": "______"
   },
   {
    "t": "text",
    "v": "；绝对值相等的两数相“乘减”，都得"
   },
   {
    "t": "text",
    "v": "0"
   },
   {
    "t": "text",
    "v": "；一个数与"
   },
   {
    "t": "text",
    "v": "0"
   },
   {
    "t": "text",
    "v": "相“乘减”，或"
   },
   {
    "t": "text",
    "v": "0"
   },
   {
    "t": "text",
    "v": "与一个数相“乘减”，都得这个数的绝对值．"
   },
   {
    "t": "break"
   },
   {
    "t": "text",
    "v": "（2）"
   },
   {
    "t": "text",
    "v": "若括号的作用与它在有理数运算中的作用相同，"
   },
   {
    "t": "break"
   },
   {
    "t": "img",
    "rid": "rId175",
    "src": "media/image83.png",
    "kind": "formula"
   },
   {
    "t": "text",
    "v": "用“乘减法”计算："
   },
   {
    "t": "img",
    "rid": "rId293",
    "src": "media/image124.png",
    "kind": "formula"
   },
   {
    "t": "text",
    "v": "______"
   },
   {
    "t": "text",
    "v": "．"
   },
   {
    "t": "break"
   },
   {
    "t": "img",
    "rid": "rId177",
    "src": "media/image84.png",
    "kind": "formula"
   },
   {
    "t": "text",
    "v": "小东发现交换律在有理数的“乘减法”中仍然成立，即"
   },
   {
    "t": "img",
    "rid": "rId296",
    "src": "media/image125.png",
    "kind": "formula"
   },
   {
    "t": "text",
    "v": "．但是结合律在有理数的“乘减法”中不一定成立，请你举一个例子说明"
   },
   {
    "t": "img",
    "rid": "rId298",
    "src": "media/image126.png",
    "kind": "formula"
   },
   {
    "t": "text",
    "v": "不成立．"
   }
  ],
  "rawParas": [
   "25. 小东对有理数⟨公式⟩定义了一种新的运算，叫做“乘减法”，记作“⟨公式⟩”．他写出了一些按照“乘减法”运算的算式：⟨公式⟩，⟨公式⟩，⟨公式⟩，⟨公式⟩，⟨公式⟩，⟨公式⟩，⟨公式⟩，⟨公式⟩，⟨公式⟩，⟨公式⟩．",
   "小玲看了这些算式后说：“我明白你定义的乘减法法则了．”她将法则整理出来给小东看，小东说：“你的理解完全正确．”",
   "（1）请将下面小玲整理的“乘减法”法则补充完整：",
   "绝对值不相等的两数相“乘减”，同号得______，异号得______，并______；绝对值相等的两数相“乘减”，都得0；一个数与0相“乘减”，或0与一个数相“乘减”，都得这个数的绝对值．",
   "（2）若括号的作用与它在有理数运算中的作用相同，",
   "⟨公式⟩用“乘减法”计算：⟨公式⟩______．",
   "⟨公式⟩小东发现交换律在有理数的“乘减法”中仍然成立，即⟨公式⟩．但是结合律在有理数的“乘减法”中不一定成立，请你举一个例子说明⟨公式⟩不成立．"
  ],
  "options": null,
  "optionParts": null,
  "key": null,
  "answer": null,
  "officialKey": null
 },
 {
  "id": "p2022-q26",
  "paperId": "p2022",
  "year": "2022—2023",
  "no": 26,
  "qtype": "big",
  "chapter": "ch-rational",
  "cat": "推理",
  "score": 6,
  "diff": "top",
  "topic": "数轴与整除",
  "name": "数轴 + 整除（含参）",
  "bonus": true,
  "hasAnswer": false,
  "stemText": "已知点⟨公式⟩在数轴上，它们表示的数分别是⟨公式⟩，且⟨公式⟩，⟨公式⟩，⟨公式⟩，⟨公式⟩（其中⟨公式⟩）．⟨公式⟩（1）若⟨公式⟩，⟨公式⟩为任意的整数．⟨公式⟩⟨公式⟩用含⟨公式⟩的式子表示⟨公式⟩；⟨公式⟩⟨公式⟩试说明⟨公式⟩一定能被4整除；⟨公式⟩（2）若⟨公式⟩，且⟨公式⟩中有两个数的和与⟨公式⟩相等．⟨公式⟩⟨公式⟩有如下四个结论：⟨公式⟩其中所有正确的结论是______．（填选项字母即可）⟨公式⟩⟨公式⟩用含⟨公式⟩的式子表示⟨公式⟩，并直接写出结果．",
  "stemParts": [
   {
    "t": "text",
    "v": ""
   },
   {
    "t": "text",
    "v": "已知点"
   },
   {
    "t": "img",
    "rid": "rId300",
    "src": "media/image127.png",
    "kind": "formula"
   },
   {
    "t": "text",
    "v": "在数轴上，它们表示的数分别是"
   },
   {
    "t": "img",
    "rid": "rId302",
    "src": "media/image128.png",
    "kind": "formula"
   },
   {
    "t": "text",
    "v": "，且"
   },
   {
    "t": "img",
    "rid": "rId304",
    "src": "media/image129.png",
    "kind": "formula"
   },
   {
    "t": "text",
    "v": "，"
   },
   {
    "t": "img",
    "rid": "rId306",
    "src": "media/image130.png",
    "kind": "formula"
   },
   {
    "t": "text",
    "v": "，"
   },
   {
    "t": "img",
    "rid": "rId308",
    "src": "media/image131.png",
    "kind": "formula"
   },
   {
    "t": "text",
    "v": "，"
   },
   {
    "t": "img",
    "rid": "rId310",
    "src": "media/image132.png",
    "kind": "formula"
   },
   {
    "t": "text",
    "v": "（其中"
   },
   {
    "t": "img",
    "rid": "rId312",
    "src": "media/image133.png",
    "kind": "formula"
   },
   {
    "t": "text",
    "v": "）．"
   },
   {
    "t": "break"
   },
   {
    "t": "text",
    "v": "（1）"
   },
   {
    "t": "text",
    "v": "若"
   },
   {
    "t": "img",
    "rid": "rId314",
    "src": "media/image134.png",
    "kind": "formula"
   },
   {
    "t": "text",
    "v": "，"
   },
   {
    "t": "img",
    "rid": "rId101",
    "src": "media/image51.png",
    "kind": "formula"
   },
   {
    "t": "text",
    "v": "为任意的整数．"
   },
   {
    "t": "break"
   },
   {
    "t": "img",
    "rid": "rId175",
    "src": "media/image83.png",
    "kind": "formula"
   },
   {
    "t": "text",
    "v": "用含"
   },
   {
    "t": "img",
    "rid": "rId101",
    "src": "media/image51.png",
    "kind": "formula"
   },
   {
    "t": "text",
    "v": "的式子表示"
   },
   {
    "t": "img",
    "rid": "rId319",
    "src": "media/image135.png",
    "kind": "formula"
   },
   {
    "t": "text",
    "v": "；"
   },
   {
    "t": "break"
   },
   {
    "t": "img",
    "rid": "rId177",
    "src": "media/image84.png",
    "kind": "formula"
   },
   {
    "t": "text",
    "v": "试说明"
   },
   {
    "t": "img",
    "rid": "rId322",
    "src": "media/image136.png",
    "kind": "formula"
   },
   {
    "t": "text",
    "v": "一定能被"
   },
   {
    "t": "text",
    "v": "4"
   },
   {
    "t": "text",
    "v": "整除；"
   },
   {
    "t": "break"
   },
   {
    "t": "text",
    "v": "（2）"
   },
   {
    "t": "text",
    "v": "若"
   },
   {
    "t": "img",
    "rid": "rId324",
    "src": "media/image137.png",
    "kind": "formula"
   },
   {
    "t": "text",
    "v": "，且"
   },
   {
    "t": "img",
    "rid": "rId302",
    "src": "media/image128.png",
    "kind": "formula"
   },
   {
    "t": "text",
    "v": "中有两个数的和与"
   },
   {
    "t": "img",
    "rid": "rId322",
    "src": "media/image136.png",
    "kind": "formula"
   },
   {
    "t": "text",
    "v": "相等．"
   },
   {
    "t": "break"
   },
   {
    "t": "img",
    "rid": "rId175",
    "src": "media/image83.png",
    "kind": "formula"
   },
   {
    "t": "text",
    "v": "有如下四个结论："
   },
   {
    "t": "break"
   },
   {
    "t": "text",
    "v": "其中所有正确的结论是"
   },
   {
    "t": "text",
    "v": "______"
   },
   {
    "t": "text",
    "v": "．（填选项字母即可）"
   },
   {
    "t": "break"
   },
   {
    "t": "img",
    "rid": "rId177",
    "src": "media/image84.png",
    "kind": "formula"
   },
   {
    "t": "text",
    "v": "用含"
   },
   {
    "t": "img",
    "rid": "rId99",
    "src": "media/image50.png",
    "kind": "formula"
   },
   {
    "t": "text",
    "v": "的式子表示"
   },
   {
    "t": "img",
    "rid": "rId101",
    "src": "media/image51.png",
    "kind": "formula"
   },
   {
    "t": "text",
    "v": "，并直接写出结果．"
   }
  ],
  "rawParas": [
   "26. 已知点⟨公式⟩在数轴上，它们表示的数分别是⟨公式⟩，且⟨公式⟩，⟨公式⟩，⟨公式⟩，⟨公式⟩（其中⟨公式⟩）．",
   "（1）若⟨公式⟩，⟨公式⟩为任意的整数．",
   "⟨公式⟩用含⟨公式⟩的式子表示⟨公式⟩；",
   "⟨公式⟩试说明⟨公式⟩一定能被4整除；",
   "（2）若⟨公式⟩，且⟨公式⟩中有两个数的和与⟨公式⟩相等．",
   "⟨公式⟩有如下四个结论：",
   "A．原点⟨公式⟩可能与点⟨公式⟩重合；         B．原点⟨公式⟩不可能在点⟨公式⟩的右侧；",
   "C．原点⟨公式⟩可能是线段⟨公式⟩的中点；    D．原点⟨公式⟩可能是线段⟨公式⟩的中点；",
   "其中所有正确的结论是______．（填选项字母即可）",
   "⟨公式⟩用含⟨公式⟩的式子表示⟨公式⟩，并直接写出结果．"
  ],
  "options": null,
  "optionParts": null,
  "key": null,
  "answer": null,
  "officialKey": null
 },
 {
  "id": "p2023-q1",
  "paperId": "p2023",
  "year": "2023—2024",
  "no": 1,
  "qtype": "single",
  "chapter": "ch-rational",
  "cat": "概念",
  "score": 2,
  "diff": "easy",
  "topic": "绝对值",
  "name": "绝对值",
  "bonus": false,
  "hasAnswer": true,
  "stemText": "−3/4的相反数是（）",
  "stemParts": [
   {
    "t": "text",
    "v": "−3/4的相反数是（）"
   }
  ],
  "rawParas": [
   "1.−3/4的相反数是（）",
   "A−4/3B.4/3C.−3/4D.3/4"
  ],
  "options": [
   "A−4/3",
   "4/3",
   "−3/4",
   "3/4"
  ],
  "optionParts": [
   [
    {
     "t": "text",
     "v": "−4/3"
    }
   ],
   [
    {
     "t": "text",
     "v": "4/3"
    }
   ],
   [
    {
     "t": "text",
     "v": "−3/4"
    }
   ],
   [
    {
     "t": "text",
     "v": "3/4"
    }
   ]
  ],
  "key": 3,
  "answer": "3/4",
  "officialKey": "D"
 },
 {
  "id": "p2023-q2",
  "paperId": "p2023",
  "year": "2023—2024",
  "no": 2,
  "qtype": "single",
  "chapter": "ch-op",
  "cat": "概念",
  "score": 2,
  "diff": "easy",
  "topic": "科学记数法",
  "name": "科学记数法",
  "bonus": false,
  "hasAnswer": true,
  "stemText": "红树林、海草床和滨海盐沼组成三大滨海“蓝碳”生态系统．相关数据显示，按全球平均值估算，我国 三大滨海“蓝碳”生态系统的年碳汇量最高可达约3080000吨二氧化碳．将3080000用科学记数法表示应 为（）",
  "stemParts": [
   {
    "t": "text",
    "v": "红树林、海草床和滨海盐沼组成三大滨海“蓝碳”生态系统．相关数据显示，按全球平均值估算，我国 三大滨海“蓝碳”生态系统的年碳汇量最高可达约3080000吨二氧化碳．将3080000用科学记数法表示应 为（）"
   }
  ],
  "rawParas": [
   "2.红树林、海草床和滨海盐沼组成三大滨海“蓝碳”生态系统．相关数据显示，按全球平均值估算，我国",
   "三大滨海“蓝碳”生态系统的年碳汇量最高可达约3080000吨二氧化碳．将3080000用科学记数法表示应",
   "为（）",
   "A.3.08×10⁴B.3.08×10⁶C.308×10⁴D.0.308×10⁷"
  ],
  "options": [
   "3.08×10⁴",
   "3.08×10⁶",
   "308×10⁴",
   "0.308×10⁷"
  ],
  "optionParts": [
   [
    {
     "t": "text",
     "v": "3.08×10⁴"
    }
   ],
   [
    {
     "t": "text",
     "v": "3.08×10⁶"
    }
   ],
   [
    {
     "t": "text",
     "v": "308×10⁴"
    }
   ],
   [
    {
     "t": "text",
     "v": "0.308×10⁷"
    }
   ]
  ],
  "key": 1,
  "answer": "3.08×10⁶",
  "officialKey": "B"
 },
 {
  "id": "p2023-q3",
  "paperId": "p2023",
  "year": "2023—2024",
  "no": 3,
  "qtype": "single",
  "chapter": "ch-geo",
  "cat": "空间",
  "score": 2,
  "diff": "easy",
  "topic": "展开图识别",
  "name": "展开图识别（三棱柱）",
  "bonus": false,
  "hasAnswer": true,
  "stemText": "如图是某个几何体的展开图，则该几何体是（）",
  "stemParts": [
   {
    "t": "text",
    "v": "如图是某个几何体的展开图，则该几何体是（）"
   },
   {
    "t": "break"
   },
   {
    "t": "img",
    "rid": "q3-figure",
    "src": "media/q3-f-003.png",
    "kind": "figure"
   }
  ],
  "rawParas": [
   "3.如图是某个几何体的展开图，则该几何体是（）",
   "A.五棱柱B.长方体C.五棱锥D.六棱柱"
  ],
  "options": [
   "五棱柱",
   "长方体",
   "五棱锥",
   "六棱柱"
  ],
  "optionParts": [
   [
    {
     "t": "text",
     "v": "五棱柱"
    }
   ],
   [
    {
     "t": "text",
     "v": "长方体"
    }
   ],
   [
    {
     "t": "text",
     "v": "五棱锥"
    }
   ],
   [
    {
     "t": "text",
     "v": "六棱柱"
    }
   ]
  ],
  "key": 0,
  "answer": "五棱柱",
  "officialKey": "A"
 },
 {
  "id": "p2023-q4",
  "paperId": "p2023",
  "year": "2023—2024",
  "no": 4,
  "qtype": "single",
  "chapter": "ch-poly",
  "cat": "计算",
  "score": 2,
  "diff": "easy",
  "topic": "合并同类项辨析",
  "name": "合并同类项辨析",
  "bonus": false,
  "hasAnswer": true,
  "stemText": "有理数a，b在数轴上的对应点的位置如图所示，则下列结论正确的是（）",
  "stemParts": [
   {
    "t": "text",
    "v": "有理数a，b在数轴上的对应点的位置如图所示，则下列结论正确的是（）"
   },
   {
    "t": "break"
   },
   {
    "t": "img",
    "src": "media/q4-f-005.png",
    "kind": "figure"
   }
  ],
  "rawParas": [
   "4.有理数a，b在数轴上的对应点的位置如图所示，则下列结论正确的是（）",
   "A.a>bB.b<aC.ab>0D.a+b<−3"
  ],
  "options": [
   "a>b",
   "b<a",
   "ab>0",
   "a+b<−3"
  ],
  "optionParts": [
   [
    {
     "t": "text",
     "v": "a>b"
    }
   ],
   [
    {
     "t": "text",
     "v": "b<a"
    }
   ],
   [
    {
     "t": "text",
     "v": "ab>0"
    }
   ],
   [
    {
     "t": "text",
     "v": "a+b<−3"
    }
   ]
  ],
  "key": 1,
  "answer": "b<a",
  "officialKey": "B"
 },
 {
  "id": "p2023-q5",
  "paperId": "p2023",
  "year": "2023—2024",
  "no": 5,
  "qtype": "single",
  "chapter": "ch-eq",
  "cat": "建模",
  "score": 2,
  "diff": "mid",
  "topic": "余角补角列方程",
  "name": "余角列方程",
  "bonus": false,
  "hasAnswer": true,
  "stemText": "下列计算中正确的是（）",
  "stemParts": [
   {
    "t": "text",
    "v": "下列计算中正确的是（）"
   }
  ],
  "rawParas": [
   "5.下列计算中正确的是（）",
   "A.2x+3y=5xyB.6x²−(−x²)=5x²",
   "C.4mn−3mn=1D.−7ab²+4ab²=−3ab²"
  ],
  "options": [
   "2x+3y=5xy",
   "6x²−(−x²)=5x²",
   "4mn−3mn=1",
   "−7ab²+4ab²=−3ab²"
  ],
  "optionParts": [
   [
    {
     "t": "text",
     "v": "2x+3y=5xy"
    }
   ],
   [
    {
     "t": "text",
     "v": "6x²−(−x²)=5x²"
    }
   ],
   [
    {
     "t": "text",
     "v": "4mn−3mn=1"
    }
   ],
   [
    {
     "t": "text",
     "v": "−7ab²+4ab²=−3ab²"
    }
   ]
  ],
  "key": 3,
  "answer": "−7ab²+4ab²=−3ab²",
  "officialKey": "D"
 },
 {
  "id": "p2023-q6",
  "paperId": "p2023",
  "year": "2023—2024",
  "no": 6,
  "qtype": "single",
  "chapter": "ch-rational",
  "cat": "概念",
  "score": 2,
  "diff": "mid",
  "topic": "数轴读符号",
  "name": "数轴判断符号",
  "bonus": false,
  "hasAnswer": true,
  "stemText": "已知一个角比它的补角小30°，则这个角的大小为（）",
  "stemParts": [
   {
    "t": "text",
    "v": "已知一个角比它的补角小30°，则这个角的大小为（）"
   }
  ],
  "rawParas": [
   "6.已知一个角比它的补角小30°，则这个角的大小为（）",
   "A.30°B.60°C.75°D.105°"
  ],
  "options": [
   "30°",
   "60°",
   "75°",
   "105°"
  ],
  "optionParts": [
   [
    {
     "t": "text",
     "v": "30°"
    }
   ],
   [
    {
     "t": "text",
     "v": "60°"
    }
   ],
   [
    {
     "t": "text",
     "v": "75°"
    }
   ],
   [
    {
     "t": "text",
     "v": "105°"
    }
   ]
  ],
  "key": 2,
  "answer": "75°",
  "officialKey": "C"
 },
 {
  "id": "p2023-q7",
  "paperId": "p2023",
  "year": "2023—2024",
  "no": 7,
  "qtype": "single",
  "chapter": "ch-eq",
  "cat": "概念",
  "score": 2,
  "diff": "mid",
  "topic": "方程变形与等式性质",
  "name": "方程变形辨析",
  "bonus": false,
  "hasAnswer": true,
  "stemText": "若x−3y=−4，则(x−3y)²+2x−6y−10的值为（）",
  "stemParts": [
   {
    "t": "text",
    "v": "若x−3y=−4，则(x−3y)²+2x−6y−10的值为（）"
   }
  ],
  "rawParas": [
   "7.若x−3y=−4，则(x−3y)²+2x−6y−10的值为（）",
   "A.14B.2C.−18D.−2"
  ],
  "options": [
   "14",
   "2",
   "−18",
   "−2"
  ],
  "optionParts": [
   [
    {
     "t": "text",
     "v": "14"
    }
   ],
   [
    {
     "t": "text",
     "v": "2"
    }
   ],
   [
    {
     "t": "text",
     "v": "−18"
    }
   ],
   [
    {
     "t": "text",
     "v": "−2"
    }
   ]
  ],
  "key": 3,
  "answer": "−2",
  "officialKey": "D"
 },
 {
  "id": "p2023-q8",
  "paperId": "p2023",
  "year": "2023—2024",
  "no": 8,
  "qtype": "single",
  "chapter": "ch-geo",
  "cat": "分类",
  "score": 2,
  "diff": "hard",
  "topic": "线段中点计算",
  "name": "线段距离和最小（分类讨论）",
  "bonus": false,
  "hasAnswer": true,
  "stemText": "用边长相等的正方形和等边三角形卡片按如图所示的方式和规律拼出图形．拼第1个图形所用两种卡片 的总数为7枚，拼第2个图形所用两种卡片的总数为12枚……若按照这样的规律拼出的第n个图形中， 所用正方形卡片比等边三角形卡片多10枚，则拼第n个图形所用两种卡片的总数为（）",
  "stemParts": [
   {
    "t": "text",
    "v": "用边长相等的正方形和等边三角形卡片按如图所示的方式和规律拼出图形．拼第1个图形所用两种卡片 的总数为7枚，拼第2个图形所用两种卡片的总数为12枚……若按照这样的规律拼出的第n个图形中， 所用正方形卡片比等边三角形卡片多10枚，则拼第n个图形所用两种卡片的总数为（）"
   },
   {
    "t": "break"
   },
   {
    "t": "img",
    "src": "media/q8-f-010.png",
    "kind": "figure"
   }
  ],
  "rawParas": [
   "8.用边长相等的正方形和等边三角形卡片按如图所示的方式和规律拼出图形．拼第1个图形所用两种卡片",
   "的总数为7枚，拼第2个图形所用两种卡片的总数为12枚……若按照这样的规律拼出的第n个图形中，",
   "所用正方形卡片比等边三角形卡片多10枚，则拼第n个图形所用两种卡片的总数为（）",
   "A.57枚B.52枚C.50枚D.47枚"
  ],
  "options": [
   "57枚",
   "52枚",
   "50枚",
   "47枚"
  ],
  "optionParts": [
   [
    {
     "t": "text",
     "v": "57枚"
    }
   ],
   [
    {
     "t": "text",
     "v": "52枚"
    }
   ],
   [
    {
     "t": "text",
     "v": "50枚"
    }
   ],
   [
    {
     "t": "text",
     "v": "47枚"
    }
   ]
  ],
  "key": 1,
  "answer": "52枚",
  "officialKey": "B"
 },
 {
  "id": "p2023-q9",
  "paperId": "p2023",
  "year": "2023—2024",
  "no": 9,
  "qtype": "calc",
  "chapter": "ch-rational",
  "cat": "概念",
  "score": 2,
  "diff": "easy",
  "topic": "相反数",
  "name": "正负数意义",
  "bonus": false,
  "hasAnswer": true,
  "stemText": "用四舍五入法把4.0692精确到0.01，所得到的近似数为______．",
  "stemParts": [
   {
    "t": "text",
    "v": "用四舍五入法把4.0692精确到0.01，所得到的近似数为______．"
   }
  ],
  "rawParas": [
   "9.用四舍五入法把4.0692精确到0.01，所得到的近似数为______．"
  ],
  "options": null,
  "optionParts": null,
  "key": null,
  "answer": "4.07",
  "accept": [
   "4.07"
  ],
  "officialKey": "4.07"
 },
 {
  "id": "p2023-q10",
  "paperId": "p2023",
  "year": "2023—2024",
  "no": 10,
  "qtype": "calc",
  "chapter": "ch-rational",
  "cat": "概念",
  "score": 2,
  "diff": "easy",
  "topic": "数轴读符号",
  "name": "有理数比较大小",
  "bonus": false,
  "hasAnswer": true,
  "stemText": "计算：31°15′×4=______°．",
  "stemParts": [
   {
    "t": "text",
    "v": "计算：31°15′×4=______°．"
   }
  ],
  "rawParas": [
   "10.计算：31°15′×4=______°．"
  ],
  "options": null,
  "optionParts": null,
  "key": null,
  "answer": "125",
  "accept": [
   "125"
  ],
  "officialKey": "125"
 },
 {
  "id": "p2023-q11",
  "paperId": "p2023",
  "year": "2023—2024",
  "no": 11,
  "qtype": "calc",
  "chapter": "ch-geo",
  "cat": "计算",
  "score": 2,
  "diff": "mid",
  "topic": "角的和差计算",
  "name": "网格中角的大小比较",
  "bonus": false,
  "hasAnswer": true,
  "stemText": "若x+1+(y−8)²=0，则x−y的值为______．",
  "stemParts": [
   {
    "t": "text",
    "v": "若x+1+(y−8)²=0，则x−y的值为______．"
   }
  ],
  "rawParas": [
   "11.若x+1+(y−8)²=0，则x−y的值为______．"
  ],
  "options": null,
  "optionParts": null,
  "key": null,
  "answer": "−9",
  "accept": [
   "−9"
  ],
  "officialKey": "−9"
 },
 {
  "id": "p2023-q12",
  "paperId": "p2023",
  "year": "2023—2024",
  "no": 12,
  "qtype": "calc",
  "chapter": "ch-poly",
  "cat": "概念",
  "score": 2,
  "diff": "mid",
  "topic": "同类项概念",
  "name": "同类项求参数",
  "bonus": false,
  "hasAnswer": true,
  "stemText": "写出一个同时满足以下两个条件的单项式：①系数是负数；②次数是5．这个单项式可以是：______．",
  "stemParts": [
   {
    "t": "text",
    "v": "写出一个同时满足以下两个条件的单项式：①系数是负数；②次数是5．这个单项式可以是：______．"
   }
  ],
  "rawParas": [
   "12.写出一个同时满足以下两个条件的单项式：①系数是负数；②次数是5．这个单项式可以是：______．"
  ],
  "options": null,
  "optionParts": null,
  "key": null,
  "answer": "−a⁴b（答案不唯一）",
  "openAnswer": true,
  "officialKey": "−a⁴b（答案不唯一）"
 },
 {
  "id": "p2023-q13",
  "paperId": "p2023",
  "year": "2023—2024",
  "no": 13,
  "qtype": "calc",
  "chapter": "ch-eq",
  "cat": "概念",
  "score": 2,
  "diff": "easy",
  "topic": "方程解求参数",
  "name": "方程解求参数",
  "bonus": false,
  "hasAnswer": true,
  "stemText": "如图，C是线段AB的中点，点D在线段CB上，E是线段DB的中点．若AB=14，EB=2，则CD 的长为______．",
  "stemParts": [
   {
    "t": "text",
    "v": "如图，C是线段AB的中点，点D在线段CB上，E是线段DB的中点．若AB=14，EB=2，则CD 的长为______．"
   },
   {
    "t": "break"
   },
   {
    "t": "img",
    "src": "media/q13-f-011.png",
    "kind": "figure"
   }
  ],
  "rawParas": [
   "13.如图，C是线段AB的中点，点D在线段CB上，E是线段DB的中点．若AB=14，EB=2，则CD",
   "的长为______．"
  ],
  "options": null,
  "optionParts": null,
  "key": null,
  "answer": "3",
  "accept": [
   "3"
  ],
  "officialKey": "3"
 },
 {
  "id": "p2023-q14",
  "paperId": "p2023",
  "year": "2023—2024",
  "no": 14,
  "qtype": "calc",
  "chapter": "ch-expr",
  "cat": "计算",
  "score": 2,
  "diff": "mid",
  "topic": "代数式求值",
  "name": "代数式求值（整体）",
  "bonus": false,
  "hasAnswer": true,
  "stemText": "若x=6是关于x的方程3x+2m=8的解，则m的值为______．",
  "stemParts": [
   {
    "t": "text",
    "v": "若x=6是关于x的方程3x+2m=8的解，则m的值为______．"
   }
  ],
  "rawParas": [
   "14.若x=6是关于x的方程3x+2m=8的解，则m的值为______．"
  ],
  "options": null,
  "optionParts": null,
  "key": null,
  "answer": "−5",
  "accept": [
   "−5"
  ],
  "officialKey": "−5"
 },
 {
  "id": "p2023-q15",
  "paperId": "p2023",
  "year": "2023—2024",
  "no": 15,
  "qtype": "calc",
  "chapter": "ch-eq",
  "cat": "建模",
  "score": 2,
  "diff": "mid",
  "topic": "列方程（分配）",
  "name": "列方程（算法统宗·客房）",
  "bonus": false,
  "hasAnswer": true,
  "stemText": "某商品原价是每件a元，第一次降价打“九折”，第二次降价每件又减50元，则第二次降价后的售价 为每件______元．（用含a的式子表示）",
  "stemParts": [
   {
    "t": "text",
    "v": "某商品原价是每件a元，第一次降价打“九折”，第二次降价每件又减50元，则第二次降价后的售价 为每件______元．（用含a的式子表示）"
   }
  ],
  "rawParas": [
   "15.某商品原价是每件a元，第一次降价打“九折”，第二次降价每件又减50元，则第二次降价后的售价",
   "为每件______元．（用含a的式子表示）"
  ],
  "options": null,
  "optionParts": null,
  "key": null,
  "answer": "(0.9a−50)",
  "accept": [
   "(0.9a−50)"
  ],
  "officialKey": "(0.9a−50)"
 },
 {
  "id": "p2023-q16",
  "paperId": "p2023",
  "year": "2023—2024",
  "no": 16,
  "qtype": "calc",
  "chapter": "ch-op",
  "cat": "推理",
  "score": 2,
  "diff": "hard",
  "topic": "数字填图（幻方类）",
  "name": "幻方（三角形与正方形等和）",
  "bonus": false,
  "hasAnswer": true,
  "stemText": "在图所示的图案中，每个小三角形的边长都为1，把由四个小三角形组成的边长为2的大三角形称为一 个“单元”．现将1，2，3，4，5，6，7，8，9，10这十个数分别填入图中的十个小三角形中，使得对于图 中的四个．．“单元”，每个“单元”中的四个数之和都是23．若2，4，5，a已填入图中，位置如图所示，则 a表示的数是______；请按上述要求，将剩余的数填入图中（填出一种即可）． 分，第22-24题，每题7分）解答应写出文字说明、演算步骤或证明过程．",
  "stemParts": [
   {
    "t": "text",
    "v": "在图所示的图案中，每个小三角形的边长都为1，把由四个小三角形组成的边长为2的大三角形称为一 个“单元”．现将1，2，3，4，5，6，7，8，9，10这十个数分别填入图中的十个小三角形中，使得对于图 中的四个．．“单元”，每个“单元”中的四个数之和都是23．若2，4，5，a已填入图中，位置如图所示，则 a表示的数是______；请按上述要求，将剩余的数填入图中（填出一种即可）． 分，第22-24题，每题7分）解答应写出文字说明、演算步骤或证明过程．"
   },
   {
    "t": "break"
   },
   {
    "t": "img",
    "src": "media/q16-f-012.png",
    "kind": "figure"
   }
  ],
  "rawParas": [
   "16.在图所示的图案中，每个小三角形的边长都为1，把由四个小三角形组成的边长为2的大三角形称为一",
   "个“单元”．现将1，2，3，4，5，6，7，8，9，10这十个数分别填入图中的十个小三角形中，使得对于图",
   "中的四个．．“单元”，每个“单元”中的四个数之和都是23．若2，4，5，a已填入图中，位置如图所示，则",
   "a表示的数是______；请按上述要求，将剩余的数填入图中（填出一种即可）．",
   "分，第22-24题，每题7分）解答应写出文字说明、演算步骤或证明过程．"
  ],
  "options": null,
  "optionParts": null,
  "key": null,
  "answer": "3（答案不唯一）",
  "openAnswer": true,
  "officialKey": "3（答案不唯一）"
 },
 {
  "id": "p2023-q17",
  "paperId": "p2023",
  "year": "2023—2024",
  "no": 17,
  "qtype": "big",
  "chapter": "ch-op",
  "cat": "计算",
  "score": 17,
  "diff": "mid",
  "topic": "有理数混合运算",
  "name": "有理数混合运算（4 小问）",
  "bonus": false,
  "hasAnswer": true,
  "stemText": "计算： （1）−12+(−6)−(−28)； （2）(−8/5)×15/4÷(−9)； （3）(−3/16−7/24+5/6)×(−48)； （4）−3²+(7/8−1)×(−2)．",
  "stemParts": [
   {
    "t": "text",
    "v": "计算： （1）−12+(−6)−(−28)； （2）(−8/5)×15/4÷(−9)； （3）(−3/16−7/24+5/6)×(−48)； （4）−3²+(7/8−1)×(−2)．"
   }
  ],
  "rawParas": [
   "17.计算：",
   "（1）−12+(−6)−(−28)；",
   "（2）(−8/5)×15/4÷(−9)；",
   "（3）(−3/16−7/24+5/6)×(−48)；",
   "（4）−3²+(7/8−1)×(−2)．"
  ],
  "options": null,
  "optionParts": null,
  "key": null,
  "answer": "（1）10（2）2/3 （3）−17 （4）−1/29",
  "officialKey": "（1）10（2）2/3 （3）−17 （4）−1/29"
 },
 {
  "id": "p2023-q18",
  "paperId": "p2023",
  "year": "2023—2024",
  "no": 18,
  "qtype": "big",
  "chapter": "ch-poly",
  "cat": "计算",
  "score": 6,
  "diff": "mid",
  "topic": "整式化简求值",
  "name": "整式化简求值",
  "bonus": false,
  "hasAnswer": true,
  "stemText": "如图，已知三点A，B，C，作直线AB． （1）用语句表述图中点C与直线AB的关系：______； （2）用直尺和圆规完成以下作图（保留作图痕迹）：连接CA，在线段CA的延长线上作线段AD，使",
  "stemParts": [
   {
    "t": "text",
    "v": "如图，已知三点A，B，C，作直线AB． （1）用语句表述图中点C与直线AB的关系：______； （2）用直尺和圆规完成以下作图（保留作图痕迹）：连接CA，在线段CA的延长线上作线段AD，使"
   },
   {
    "t": "break"
   },
   {
    "t": "img",
    "src": "media/q18-f-021.png",
    "kind": "figure"
   }
  ],
  "rawParas": [
   "18如图，已知三点A，B，C，作直线AB．",
   "（1）用语句表述图中点C与直线AB的关系：______；",
   "（2）用直尺和圆规完成以下作图（保留作图痕迹）：连接CA，在线段CA的延长线上作线段AD，使",
   "AD=AB．",
   "（3）连接BC，比较线段DC与线段BC的长短，并将下面的推理补充完整：",
   "DC=AD+AC，AD=AB，",
   "∴DC=AB+AC，",
   "AB+AC______BC，（______）（填推理依据）",
   "∴DC______BC．"
  ],
  "options": null,
  "optionParts": null,
  "key": null,
  "answer": null,
  "officialKey": "（1）点C在直线AB外； （2）见解析（3）>；两点之间，线段最短；>"
 },
 {
  "id": "p2023-q19",
  "paperId": "p2023",
  "year": "2023—2024",
  "no": 19,
  "qtype": "calc",
  "chapter": "ch-geo",
  "cat": "作图",
  "score": 6,
  "diff": "mid",
  "topic": "尺规作图与说理",
  "name": "尺规作图 + 三边关系说理",
  "bonus": false,
  "hasAnswer": true,
  "stemText": "求3(x−2y²)−(3y²+7x)+10y²的值，其中x=−1/4，y=5．",
  "stemParts": [
   {
    "t": "text",
    "v": "求3(x−2y²)−(3y²+7x)+10y²的值，其中x=−1/4，y=5．"
   }
  ],
  "rawParas": [
   "19.求3(x−2y²)−(3y²+7x)+10y²的值，其中x=−1/4，y=5．"
  ],
  "options": null,
  "optionParts": null,
  "key": null,
  "answer": "−4x+y²，26",
  "accept": [
   "−4x+y²，26"
  ],
  "officialKey": "−4x+y²，26"
 },
 {
  "id": "p2023-q20",
  "paperId": "p2023",
  "year": "2023—2024",
  "no": 20,
  "qtype": "big",
  "chapter": "ch-eq",
  "cat": "计算",
  "score": 12,
  "diff": "mid",
  "topic": "解一元一次方程",
  "name": "解方程（2 小问，含去分母）",
  "bonus": false,
  "hasAnswer": true,
  "stemText": "解下列方程： （1）7x−20=2(3−3x)； 2x−33x−1 （2）=+1． 52",
  "stemParts": [
   {
    "t": "text",
    "v": "解下列方程： （1）7x−20=2(3−3x)； 2x−33x−1 （2）=+1． 52"
   }
  ],
  "rawParas": [
   "20.解下列方程：",
   "（1）7x−20=2(3−3x)；",
   "2x−33x−1",
   "（2）=+1．",
   "52"
  ],
  "options": null,
  "optionParts": null,
  "key": null,
  "answer": "（1）x=2 （2）x=−1",
  "officialKey": "（1）x=2 （2）x=−1"
 },
 {
  "id": "p2023-q21",
  "paperId": "p2023",
  "year": "2023—2024",
  "no": 21,
  "qtype": "big",
  "chapter": "ch-geo",
  "cat": "推理",
  "score": 6,
  "diff": "mid",
  "topic": "角度推理与说理",
  "name": "角度推理填空（双角平分线）",
  "bonus": false,
  "hasAnswer": true,
  "stemText": "如图，∠AOB=∠COD，∠AOC=90°．过点O在∠AOC的内部画射线OE． 探究发现： （1）当∠EOD=90°时，OA平分∠EOB． ①依题意补全图形； ②将下面的推理补充完整． 证明：∠EOD=90°， ∴∠EOC+∠______=90°， ∠AOB=∠COD， ∴∠EOC+∠______=90°， ∠AOC=90°， ∴∠EOC+∠AOE=90°， ∴∠______=∠（）．（______）（填推理的依据） ∴OA平分∠EOB （2）当∠EOB=90°时，射线______平分∠______．",
  "stemParts": [
   {
    "t": "text",
    "v": "如图，∠AOB=∠COD，∠AOC=90°．过点O在∠AOC的内部画射线OE． 探究发现： （1）当∠EOD=90°时，OA平分∠EOB． ①依题意补全图形； ②将下面的推理补充完整． 证明：∠EOD=90°， ∴∠EOC+∠______=90°， ∠AOB=∠COD， ∴∠EOC+∠______=90°， ∠AOC=90°， ∴∠EOC+∠AOE=90°， ∴∠______=∠（）．（______）（填推理的依据） ∴OA平分∠EOB （2）当∠EOB=90°时，射线______平分∠______．"
   },
   {
    "t": "break"
   },
   {
    "t": "img",
    "src": "media/q21-f-032.png",
    "kind": "figure"
   }
  ],
  "rawParas": [
   "21.如图，∠AOB=∠COD，∠AOC=90°．过点O在∠AOC的内部画射线OE．",
   "探究发现：",
   "（1）当∠EOD=90°时，OA平分∠EOB．",
   "①依题意补全图形；",
   "②将下面的推理补充完整．",
   "证明：∠EOD=90°，",
   "∴∠EOC+∠______=90°，",
   "∠AOB=∠COD，",
   "∴∠EOC+∠______=90°，",
   "∠AOC=90°，",
   "∴∠EOC+∠AOE=90°，",
   "∴∠______=∠（）．（______）（填推理的依据）",
   "∴OA平分∠EOB",
   "（2）当∠EOB=90°时，射线______平分∠______．"
  ],
  "options": null,
  "optionParts": null,
  "key": null,
  "answer": null,
  "officialKey": "（1）①见解析：②∠COD，∠AOB，∠AOB，∠AOE，同角的余角相等 （2）OC，∠EOD"
 },
 {
  "id": "p2023-q22",
  "paperId": "p2023",
  "year": "2023—2024",
  "no": 22,
  "qtype": "big",
  "chapter": "ch-eq",
  "cat": "建模",
  "score": 7,
  "diff": "mid",
  "topic": "方程应用（配套/分配）",
  "name": "方程应用题（工期与费用）",
  "bonus": false,
  "hasAnswer": true,
  "stemText": "用A，B两种型号的机器生产相同的产品，产品装入同样规格的包装箱后运往仓库．已知每台B型机 器比A型机器一天多生产2件产品，3台A型机器一天生产的产品恰好能装满5箱，4台B型机器一天生 产的产品恰好能装满7箱．每台A型机器一天生产多少件产品？每箱装多少件产品？ 下面是解决该问题的两种方法，请选择其中的一种．．．．．．．方法完成分析和解答． 方法二 方法一 分析：设每箱装x件产品，则3台A型机 分析：设每台A型机器一天生产x件产品，则每台B型机 器一天共生产______件产品，4台B型机 器一天生产(x+2)件产品，3台A型机器一天共生产器一天共生产______件产品，再根据题意 ______件产品，4台B型机器一天共生产______件产品，列方程． 再根据题意列方程．解：设每箱装x件产品． 解：设每台A型机器一天生产x件产品． 答： 答：",
  "stemParts": [
   {
    "t": "text",
    "v": "用A，B两种型号的机器生产相同的产品，产品装入同样规格的包装箱后运往仓库．已知每台B型机 器比A型机器一天多生产2件产品，3台A型机器一天生产的产品恰好能装满5箱，4台B型机器一天生 产的产品恰好能装满7箱．每台A型机器一天生产多少件产品？每箱装多少件产品？ 下面是解决该问题的两种方法，请选择其中的一种．．．．．．．方法完成分析和解答． 方法二 方法一 分析：设每箱装x件产品，则3台A型机 分析：设每台A型机器一天生产x件产品，则每台B型机 器一天共生产______件产品，4台B型机 器一天生产(x+2)件产品，3台A型机器一天共生产器一天共生产______件产品，再根据题意 ______件产品，4台B型机器一天共生产______件产品，列方程． 再根据题意列方程．解：设每箱装x件产品． 解：设每台A型机器一天生产x件产品． 答： 答："
   }
  ],
  "rawParas": [
   "22.用A，B两种型号的机器生产相同的产品，产品装入同样规格的包装箱后运往仓库．已知每台B型机",
   "器比A型机器一天多生产2件产品，3台A型机器一天生产的产品恰好能装满5箱，4台B型机器一天生",
   "产的产品恰好能装满7箱．每台A型机器一天生产多少件产品？每箱装多少件产品？",
   "下面是解决该问题的两种方法，请选择其中的一种．．．．．．．方法完成分析和解答．",
   "方法二",
   "方法一",
   "分析：设每箱装x件产品，则3台A型机",
   "分析：设每台A型机器一天生产x件产品，则每台B型机",
   "器一天共生产______件产品，4台B型机",
   "器一天生产(x+2)件产品，3台A型机器一天共生产器一天共生产______件产品，再根据题意",
   "______件产品，4台B型机器一天共生产______件产品，列方程．",
   "再根据题意列方程．解：设每箱装x件产品．",
   "解：设每台A型机器一天生产x件产品．",
   "答：",
   "答："
  ],
  "options": null,
  "optionParts": null,
  "key": null,
  "answer": "每台A型机器一天生产40件产品，每箱装24件产品．",
  "officialKey": "每台A型机器一天生产40件产品，每箱装24件产品．"
 },
 {
  "id": "p2023-q23",
  "paperId": "p2023",
  "year": "2023—2024",
  "no": 23,
  "qtype": "big",
  "chapter": "ch-geo",
  "cat": "分类",
  "score": 7,
  "diff": "top",
  "topic": "线段中点压轴（含参）",
  "name": "线段中点 + 延长线（含参）",
  "bonus": false,
  "hasAnswer": true,
  "stemText": "已知∠AOB=75°，射线OC在∠AOB内部，且∠AOC=4∠BOC．射线OD是平面上绕点O旋 转的一条动射线，OE平分∠DOC． （1）如图1，射线OD在∠AOC内部． ①求∠BOC的度数； ②若∠EOC与∠DOB互余，求∠EOC的度数； （2）若∠AOD=n°(0<n<60)，直接写出∠BOE的度数（用含n的式子表示）．",
  "stemParts": [
   {
    "t": "text",
    "v": "已知∠AOB=75°，射线OC在∠AOB内部，且∠AOC=4∠BOC．射线OD是平面上绕点O旋 转的一条动射线，OE平分∠DOC． （1）如图1，射线OD在∠AOC内部． ①求∠BOC的度数； ②若∠EOC与∠DOB互余，求∠EOC的度数； （2）若∠AOD=n°(0<n<60)，直接写出∠BOE的度数（用含n的式子表示）．"
   },
   {
    "t": "break"
   },
   {
    "t": "img",
    "src": "media/q23-f-037.png",
    "kind": "figure"
   }
  ],
  "rawParas": [
   "23.已知∠AOB=75°，射线OC在∠AOB内部，且∠AOC=4∠BOC．射线OD是平面上绕点O旋",
   "转的一条动射线，OE平分∠DOC．",
   "（1）如图1，射线OD在∠AOC内部．",
   "①求∠BOC的度数；",
   "②若∠EOC与∠DOB互余，求∠EOC的度数；",
   "（2）若∠AOD=n°(0<n<60)，直接写出∠BOE的度数（用含n的式子表示）．"
  ],
  "options": null,
  "optionParts": null,
  "key": null,
  "answer": "（1）①∠BOC=15°；②∠EOC=25° （2）45°−1/2n°或45°+1/2n°",
  "officialKey": "（1）①∠BOC=15°；②∠EOC=25° （2）45°−1/2n°或45°+1/2n°"
 },
 {
  "id": "p2023-q24",
  "paperId": "p2023",
  "year": "2023—2024",
  "no": 24,
  "qtype": "big",
  "chapter": "ch-rational",
  "cat": "新定义",
  "score": 7,
  "diff": "top",
  "topic": "新定义（数轴类）",
  "name": "新定义「变速点」（数轴动点）",
  "bonus": false,
  "hasAnswer": true,
  "stemText": "对于数轴上不同的三个点M，N，P，若满足PM=kPN，则称点P是点M关于点N的“k倍分点”．例 如，如图，在数轴上，点M，N表示的数分別是−2，1，可知原点O是点M关于点N的“2倍分点”，原 点O也是点N关于点M的“1/2倍分点”． 在数轴上，已知点A表示的数是−4，点B表示的数是2． （1）若点C在线段AB上，且点C是点A关于点B的“5倍分点”，则点C表示的数是______； （2）若点D在数轴上，AD=，且点D是点B关于点A的“k倍分点”，求k的值； （3）点E从点B出发，以每秒10/3个单位长度的速度沿数轴正方向运动．当点E运动t秒时，在A，B，E 三个点中，恰有一个点是另一个点关于第三个点的“1/4倍分点”，直接写出t的值．",
  "stemParts": [
   {
    "t": "text",
    "v": "对于数轴上不同的三个点M，N，P，若满足PM=kPN，则称点P是点M关于点N的“k倍分点”．例 如，如图，在数轴上，点M，N表示的数分別是−2，1，可知原点O是点M关于点N的“2倍分点”，原 点O也是点N关于点M的“1/2倍分点”． 在数轴上，已知点A表示的数是−4，点B表示的数是2． （1）若点C在线段AB上，且点C是点A关于点B的“5倍分点”，则点C表示的数是______； （2）若点D在数轴上，AD=，且点D是点B关于点A的“k倍分点”，求k的值； （3）点E从点B出发，以每秒10/3个单位长度的速度沿数轴正方向运动．当点E运动t秒时，在A，B，E 三个点中，恰有一个点是另一个点关于第三个点的“1/4倍分点”，直接写出t的值．"
   },
   {
    "t": "break"
   },
   {
    "t": "img",
    "src": "media/q24-f-038.png",
    "kind": "figure"
   }
  ],
  "rawParas": [
   "24.对于数轴上不同的三个点M，N，P，若满足PM=kPN，则称点P是点M关于点N的“k倍分点”．例",
   "如，如图，在数轴上，点M，N表示的数分別是−2，1，可知原点O是点M关于点N的“2倍分点”，原",
   "点O也是点N关于点M的“1/2倍分点”．",
   "在数轴上，已知点A表示的数是−4，点B表示的数是2．",
   "（1）若点C在线段AB上，且点C是点A关于点B的“5倍分点”，则点C表示的数是______；",
   "（2）若点D在数轴上，AD=，且点D是点B关于点A的“k倍分点”，求k的值；",
   "（3）点E从点B出发，以每秒10/3个单位长度的速度沿数轴正方向运动．当点E运动t秒时，在A，B，E",
   "三个点中，恰有一个点是另一个点关于第三个点的“1/4倍分点”，直接写出t的值．"
  ],
  "options": null,
  "optionParts": null,
  "key": null,
  "answer": "（1）1（2）k=8/5或2/5 （3）1/2，2/3，6，8",
  "officialKey": "（1）1（2）k=8/5或2/5 （3）1/2，2/3，6，8"
 },
 {
  "id": "p2023-q25",
  "paperId": "p2023",
  "year": "2023—2024",
  "no": 25,
  "qtype": "big",
  "chapter": "ch-op",
  "cat": "新定义",
  "score": 4,
  "diff": "hard",
  "topic": "新定义（运算类）",
  "name": "新定义运算（迭代：相反数→加1→倒数）",
  "bonus": true,
  "hasAnswer": true,
  "stemText": "小东对有理数a，b定义了一种新的运算，叫做“乘减法”，记作“a⊗b”．他写出了一些按照“乘减 法”运算的算式：(+3)⊗(+2)=+1，(+11)⊗(−3)=−8，(−2)⊗(+5)=−3，(−6)⊗(−1)=+5， (+1/3)⊗(+1)=+2/3，(−4)⊗(+0.5)=−3.5，(−8)⊗(−8)=0，(+2.4)⊗(−2.4)=0， (+23)⊗0=+23，0⊗(−7/4)=+7/4． 小玲看了这些算式后说：“我明白你定义的乘减法法则了．”她将法则整理出来给小东看，小东说：“你 的理解完全正确．” （1）请将下面小玲整理的“乘减法”法则补充完整： 绝对值不相等的两数相“乘减”，同号得______，异号得______，并______；绝对值相等的两数相“乘 减”，都得0；一个数与0相“乘减”，或0与一个数相“乘减”，都得这个数的绝对值． （2）若括号的作用与它在有理数运算中的作用相同， ①用“乘减法”计算：(((+3)⊗(−2)))⊗(((−9)⊗0))=______． ②小东发现交换律在有理数的“乘减法”中仍然成立，即a⊗b=b⊗a．但是结合律在有理数的“乘减 法”中不一定成立，请你举一个例子说明(a⊗b)⊗c=a⊗(b⊗c)不成立．",
  "stemParts": [
   {
    "t": "text",
    "v": "小东对有理数a，b定义了一种新的运算，叫做“乘减法”，记作“a⊗b”．他写出了一些按照“乘减 法”运算的算式：(+3)⊗(+2)=+1，(+11)⊗(−3)=−8，(−2)⊗(+5)=−3，(−6)⊗(−1)=+5， (+1/3)⊗(+1)=+2/3，(−4)⊗(+0.5)=−3.5，(−8)⊗(−8)=0，(+2.4)⊗(−2.4)=0， (+23)⊗0=+23，0⊗(−7/4)=+7/4． 小玲看了这些算式后说：“我明白你定义的乘减法法则了．”她将法则整理出来给小东看，小东说：“你 的理解完全正确．” （1）请将下面小玲整理的“乘减法”法则补充完整： 绝对值不相等的两数相“乘减”，同号得______，异号得______，并______；绝对值相等的两数相“乘 减”，都得0；一个数与0相“乘减”，或0与一个数相“乘减”，都得这个数的绝对值． （2）若括号的作用与它在有理数运算中的作用相同， ①用“乘减法”计算：(((+3)⊗(−2)))⊗(((−9)⊗0))=______． ②小东发现交换律在有理数的“乘减法”中仍然成立，即a⊗b=b⊗a．但是结合律在有理数的“乘减 法”中不一定成立，请你举一个例子说明(a⊗b)⊗c=a⊗(b⊗c)不成立．"
   }
  ],
  "rawParas": [
   "25.小东对有理数a，b定义了一种新的运算，叫做“乘减法”，记作“a⊗b”．他写出了一些按照“乘减",
   "法”运算的算式：(+3)⊗(+2)=+1，(+11)⊗(−3)=−8，(−2)⊗(+5)=−3，(−6)⊗(−1)=+5，",
   "(+1/3)⊗(+1)=+2/3，(−4)⊗(+0.5)=−3.5，(−8)⊗(−8)=0，(+2.4)⊗(−2.4)=0，",
   "(+23)⊗0=+23，0⊗(−7/4)=+7/4．",
   "小玲看了这些算式后说：“我明白你定义的乘减法法则了．”她将法则整理出来给小东看，小东说：“你",
   "的理解完全正确．”",
   "（1）请将下面小玲整理的“乘减法”法则补充完整：",
   "绝对值不相等的两数相“乘减”，同号得______，异号得______，并______；绝对值相等的两数相“乘",
   "减”，都得0；一个数与0相“乘减”，或0与一个数相“乘减”，都得这个数的绝对值．",
   "（2）若括号的作用与它在有理数运算中的作用相同，",
   "①用“乘减法”计算：(((+3)⊗(−2)))⊗(((−9)⊗0))=______．",
   "②小东发现交换律在有理数的“乘减法”中仍然成立，即a⊗b=b⊗a．但是结合律在有理数的“乘减",
   "法”中不一定成立，请你举一个例子说明(a⊗b)⊗c=a⊗(b⊗c)不成立．"
  ],
  "options": null,
  "optionParts": null,
  "key": null,
  "answer": "（1）正，负，把绝对值相减",
  "officialKey": "（1）正，负，把绝对值相减"
 },
 {
  "id": "p2023-q26",
  "paperId": "p2023",
  "year": "2023—2024",
  "no": 26,
  "qtype": "big",
  "chapter": "ch-geo",
  "cat": "新定义",
  "score": 6,
  "diff": "top",
  "topic": "新定义（运算类）",
  "name": "新定义「特征值」（射线角）",
  "bonus": true,
  "hasAnswer": true,
  "stemText": "已知点A，B，C，D在数轴上，它们表示的数分别是a，b，c，d，且a<b<c<d，AB=1，",
  "stemParts": [
   {
    "t": "text",
    "v": "已知点A，B，C，D在数轴上，它们表示的数分别是a，b，c，d，且a<b<c<d，AB=1，"
   }
  ],
  "rawParas": [
   "26.已知点A，B，C，D在数轴上，它们表示的数分别是a，b，c，d，且a<b<c<d，AB=1，",
   "BC=m+3，CD=m+4（其中m>0）．",
   "（1）若m=5，a为任意的整数．",
   "①用含a的式子表示c；",
   "②试说明a+b+c+d一定能被4整除；",
   "（2）若abcd>0，且a，b，c，d中有两个数的和与a+b+c+d相等．",
   "①有如下四个结论：",
   "A．原点O可能与点B重合；B．原点O不可能在点D的右侧；",
   "C．原点O可能是线段AD的中点；D．原点O可能是线段BC的中点；",
   "其中所有正确的结论是______．（填选项字母即可）",
   "②用含m的式子表示a，并直接写出结果．"
  ],
  "options": null,
  "optionParts": null,
  "key": null,
  "answer": null,
  "officialKey": "（1）①c=a+9②见解析 −m−5−m−4 （2）①B、D；②a=或 22"
 },
 {
  "id": "p2024-q1",
  "paperId": "p2024",
  "year": "2024—2025",
  "no": 1,
  "qtype": "single",
  "chapter": "ch-rational",
  "cat": "概念",
  "score": 2,
  "diff": "easy",
  "topic": "绝对值",
  "name": "绝对值",
  "bonus": false,
  "hasAnswer": true,
  "stemText": "⟨公式⟩的绝对值为（ ）",
  "stemParts": [
   {
    "t": "text",
    "v": ""
   },
   {
    "t": "img",
    "rid": "rId8",
    "src": "media/image4.png",
    "kind": "formula"
   },
   {
    "t": "text",
    "v": "的绝对值为（ ）"
   }
  ],
  "rawParas": [
   "1. ⟨公式⟩的绝对值为（ ）",
   "A. 7B. ⟨公式⟩C. ⟨公式⟩D. ⟨公式⟩"
  ],
  "options": [
   "7",
   "⟨公式⟩",
   "⟨公式⟩",
   "⟨公式⟩"
  ],
  "optionParts": [
   [
    {
     "t": "text",
     "v": "7"
    }
   ],
   [
    {
     "t": "img",
     "rid": "rId10",
     "src": "media/image5.png",
     "kind": "formula"
    }
   ],
   [
    {
     "t": "img",
     "rid": "rId12",
     "src": "media/image6.png",
     "kind": "formula"
    }
   ],
   [
    {
     "t": "img",
     "rid": "rId8",
     "src": "media/image4.png",
     "kind": "formula"
    }
   ]
  ],
  "key": 0,
  "answer": "7",
  "officialKey": "A"
 },
 {
  "id": "p2024-q2",
  "paperId": "p2024",
  "year": "2024—2025",
  "no": 2,
  "qtype": "single",
  "chapter": "ch-op",
  "cat": "概念",
  "score": 2,
  "diff": "easy",
  "topic": "科学记数法",
  "name": "科学记数法",
  "bonus": false,
  "hasAnswer": true,
  "stemText": "国家能源局等多部门发布关于大力实施可再生能源替代行动的指导意见，提出了2025年全国可再生能源消费量达到1100000000吨标煤以上等系列目标．将1100000000用科学记数法表示应为（   ）",
  "stemParts": [
   {
    "t": "text",
    "v": ""
   },
   {
    "t": "text",
    "v": "国家能源局等多部门发布关于大力实施可再生能源替代行动的指导意见，提出了"
   },
   {
    "t": "text",
    "v": "2025"
   },
   {
    "t": "text",
    "v": "年全国可再生能源消费量达到"
   },
   {
    "t": "text",
    "v": "1100000000"
   },
   {
    "t": "text",
    "v": "吨标煤以上等系列目标．将"
   },
   {
    "t": "text",
    "v": "1100000000"
   },
   {
    "t": "text",
    "v": "用科学记数法表示应为（"
   },
   {
    "t": "text",
    "v": "   "
   },
   {
    "t": "text",
    "v": "）"
   }
  ],
  "rawParas": [
   "2. 国家能源局等多部门发布关于大力实施可再生能源替代行动的指导意见，提出了2025年全国可再生能源消费量达到1100000000吨标煤以上等系列目标．将1100000000用科学记数法表示应为（   ）",
   "A. ⟨公式⟩B. ⟨公式⟩C. ⟨公式⟩D. ⟨公式⟩"
  ],
  "options": [
   "⟨公式⟩",
   "⟨公式⟩",
   "⟨公式⟩",
   "⟨公式⟩"
  ],
  "optionParts": [
   [
    {
     "t": "img",
     "rid": "rId15",
     "src": "media/image7.png",
     "kind": "formula"
    }
   ],
   [
    {
     "t": "img",
     "rid": "rId17",
     "src": "media/image8.png",
     "kind": "formula"
    }
   ],
   [
    {
     "t": "img",
     "rid": "rId19",
     "src": "media/image9.png",
     "kind": "formula"
    }
   ],
   [
    {
     "t": "img",
     "rid": "rId21",
     "src": "media/image10.png",
     "kind": "formula"
    }
   ]
  ],
  "key": 2,
  "answer": "⟨公式⟩",
  "officialKey": "C"
 },
 {
  "id": "p2024-q3",
  "paperId": "p2024",
  "year": "2024—2025",
  "no": 3,
  "qtype": "single",
  "chapter": "ch-rational",
  "cat": "建模",
  "score": 2,
  "diff": "mid",
  "topic": "数轴读符号",
  "name": "数轴 + 相反数（列方程组）",
  "bonus": false,
  "hasAnswer": true,
  "stemText": "如图，点⟨公式⟩，⟨公式⟩在数轴上表示的数分别是⟨公式⟩，⟨公式⟩．若⟨公式⟩，⟨公式⟩互为相反数，且⟨公式⟩，则⟨公式⟩的值为（   ）⟨公式⟩⟨公式⟩",
  "stemParts": [
   {
    "t": "text",
    "v": ""
   },
   {
    "t": "text",
    "v": "如图，点"
   },
   {
    "t": "img",
    "rid": "rId23",
    "src": "media/image11.png",
    "kind": "formula"
   },
   {
    "t": "text",
    "v": "，"
   },
   {
    "t": "img",
    "rid": "rId25",
    "src": "media/image12.png",
    "kind": "formula"
   },
   {
    "t": "text",
    "v": "在数轴上表示的数分别是"
   },
   {
    "t": "img",
    "rid": "rId27",
    "src": "media/image13.png",
    "kind": "formula"
   },
   {
    "t": "text",
    "v": "，"
   },
   {
    "t": "img",
    "rid": "rId29",
    "src": "media/image14.png",
    "kind": "formula"
   },
   {
    "t": "text",
    "v": "．若"
   },
   {
    "t": "img",
    "rid": "rId27",
    "src": "media/image13.png",
    "kind": "formula"
   },
   {
    "t": "text",
    "v": "，"
   },
   {
    "t": "img",
    "rid": "rId29",
    "src": "media/image14.png",
    "kind": "formula"
   },
   {
    "t": "text",
    "v": "互为相反数，且"
   },
   {
    "t": "img",
    "rid": "rId33",
    "src": "media/image15.png",
    "kind": "formula"
   },
   {
    "t": "text",
    "v": "，则"
   },
   {
    "t": "img",
    "rid": "rId27",
    "src": "media/image13.png",
    "kind": "formula"
   },
   {
    "t": "text",
    "v": "的值为（"
   },
   {
    "t": "text",
    "v": "   "
   },
   {
    "t": "text",
    "v": "）"
   },
   {
    "t": "break"
   },
   {
    "t": "img",
    "rid": "rId36",
    "src": "media/image16.png",
    "kind": "figure"
   }
  ],
  "rawParas": [
   "3. 如图，点⟨公式⟩，⟨公式⟩在数轴上表示的数分别是⟨公式⟩，⟨公式⟩．若⟨公式⟩，⟨公式⟩互为相反数，且⟨公式⟩，则⟨公式⟩的值为（   ）",
   "⟨公式⟩",
   "A. ⟨公式⟩B. ⟨公式⟩C. ⟨公式⟩D. ⟨公式⟩"
  ],
  "options": [
   "⟨公式⟩",
   "⟨公式⟩",
   "⟨公式⟩",
   "⟨公式⟩"
  ],
  "optionParts": [
   [
    {
     "t": "img",
     "rid": "rId37",
     "src": "media/image17.png",
     "kind": "formula"
    }
   ],
   [
    {
     "t": "img",
     "rid": "rId39",
     "src": "media/image18.png",
     "kind": "formula"
    }
   ],
   [
    {
     "t": "img",
     "rid": "rId41",
     "src": "media/image19.png",
     "kind": "formula"
    }
   ],
   [
    {
     "t": "img",
     "rid": "rId43",
     "src": "media/image20.png",
     "kind": "formula"
    }
   ]
  ],
  "key": 0,
  "answer": "⟨公式⟩",
  "officialKey": "A"
 },
 {
  "id": "p2024-q4",
  "paperId": "p2024",
  "year": "2024—2025",
  "no": 4,
  "qtype": "single",
  "chapter": "ch-geo",
  "cat": "空间",
  "score": 2,
  "diff": "mid",
  "topic": "展开图识别",
  "name": "长方体展开图识别",
  "bonus": false,
  "hasAnswer": true,
  "stemText": "下列图形中可以作为一个长方体的展开图的是（   ）",
  "stemParts": [
   {
    "t": "text",
    "v": ""
   },
   {
    "t": "text",
    "v": "下列图形中可以作为一个长方体的展开图的是（"
   },
   {
    "t": "text",
    "v": "   "
   },
   {
    "t": "text",
    "v": "）"
   }
  ],
  "rawParas": [
   "4. 下列图形中可以作为一个长方体的展开图的是（   ）",
   "A. ⟨公式⟩B. ⟨公式⟩",
   "C. ⟨公式⟩D. ⟨公式⟩"
  ],
  "options": [
   "⟨公式⟩",
   "⟨公式⟩",
   "⟨公式⟩",
   "⟨公式⟩"
  ],
  "optionParts": [
   [
    {
     "t": "img",
     "rid": "rId45",
     "src": "media/image21.png",
     "kind": "figure"
    }
   ],
   [
    {
     "t": "img",
     "rid": "rId46",
     "src": "media/image22.png",
     "kind": "figure"
    }
   ],
   [
    {
     "t": "img",
     "rid": "rId47",
     "src": "media/image23.png",
     "kind": "figure"
    }
   ],
   [
    {
     "t": "img",
     "rid": "rId48",
     "src": "media/image24.png",
     "kind": "figure"
    }
   ]
  ],
  "key": 2,
  "answer": "⟨公式⟩",
  "officialKey": "C"
 },
 {
  "id": "p2024-q5",
  "paperId": "p2024",
  "year": "2024—2025",
  "no": 5,
  "qtype": "single",
  "chapter": "ch-poly",
  "cat": "计算",
  "score": 2,
  "diff": "easy",
  "topic": "合并同类项辨析",
  "name": "合并同类项辨析",
  "bonus": false,
  "hasAnswer": true,
  "stemText": "下列计算正确的是（   ）",
  "stemParts": [
   {
    "t": "text",
    "v": ""
   },
   {
    "t": "text",
    "v": "下列计算正确的是（"
   },
   {
    "t": "text",
    "v": "   "
   },
   {
    "t": "text",
    "v": "）"
   }
  ],
  "rawParas": [
   "5. 下列计算正确的是（   ）",
   "A. ⟨公式⟩B. ⟨公式⟩",
   "C. ⟨公式⟩D. ⟨公式⟩"
  ],
  "options": [
   "⟨公式⟩",
   "⟨公式⟩",
   "⟨公式⟩",
   "⟨公式⟩"
  ],
  "optionParts": [
   [
    {
     "t": "img",
     "rid": "rId49",
     "src": "media/image25.png",
     "kind": "formula"
    }
   ],
   [
    {
     "t": "img",
     "rid": "rId51",
     "src": "media/image26.png",
     "kind": "formula"
    }
   ],
   [
    {
     "t": "img",
     "rid": "rId53",
     "src": "media/image27.png",
     "kind": "formula"
    }
   ],
   [
    {
     "t": "img",
     "rid": "rId55",
     "src": "media/image28.png",
     "kind": "formula"
    }
   ]
  ],
  "key": 2,
  "answer": "⟨公式⟩",
  "officialKey": "C"
 },
 {
  "id": "p2024-q6",
  "paperId": "p2024",
  "year": "2024—2025",
  "no": 6,
  "qtype": "single",
  "chapter": "ch-eq",
  "cat": "建模",
  "score": 2,
  "diff": "mid",
  "topic": "余角补角列方程",
  "name": "补角列方程",
  "bonus": false,
  "hasAnswer": true,
  "stemText": "一个角的补角比它大⟨公式⟩，则这个角的度数为（   ）",
  "stemParts": [
   {
    "t": "text",
    "v": ""
   },
   {
    "t": "text",
    "v": "一个角的补角比它大"
   },
   {
    "t": "img",
    "rid": "rId57",
    "src": "media/image29.png",
    "kind": "formula"
   },
   {
    "t": "text",
    "v": "，则这个角的度数为（"
   },
   {
    "t": "text",
    "v": "   "
   },
   {
    "t": "text",
    "v": "）"
   }
  ],
  "rawParas": [
   "6. 一个角的补角比它大⟨公式⟩，则这个角的度数为（   ）",
   "A. ⟨公式⟩B. ⟨公式⟩C. ⟨公式⟩D. ⟨公式⟩"
  ],
  "options": [
   "⟨公式⟩",
   "⟨公式⟩",
   "⟨公式⟩",
   "⟨公式⟩"
  ],
  "optionParts": [
   [
    {
     "t": "img",
     "rid": "rId59",
     "src": "media/image30.png",
     "kind": "formula"
    }
   ],
   [
    {
     "t": "img",
     "rid": "rId61",
     "src": "media/image31.png",
     "kind": "formula"
    }
   ],
   [
    {
     "t": "img",
     "rid": "rId63",
     "src": "media/image32.png",
     "kind": "formula"
    }
   ],
   [
    {
     "t": "img",
     "rid": "rId65",
     "src": "media/image33.png",
     "kind": "formula"
    }
   ]
  ],
  "key": 3,
  "answer": "⟨公式⟩",
  "officialKey": "D"
 },
 {
  "id": "p2024-q7",
  "paperId": "p2024",
  "year": "2024—2025",
  "no": 7,
  "qtype": "single",
  "chapter": "ch-expr",
  "cat": "概念",
  "score": 2,
  "diff": "mid",
  "topic": "反比例关系",
  "name": "反比例关系判断",
  "bonus": false,
  "hasAnswer": true,
  "stemText": "下列问题中的两个量成反比例关系的是（   ）",
  "stemParts": [
   {
    "t": "text",
    "v": ""
   },
   {
    "t": "text",
    "v": "下列问题中的两个量成反比例关系的是（"
   },
   {
    "t": "text",
    "v": "   "
   },
   {
    "t": "text",
    "v": "）"
   }
  ],
  "rawParas": [
   "7. 下列问题中的两个量成反比例关系的是（   ）",
   "A. 每天阅读半小时，阅读的总时长与天数B. 50米短跑测试，跑步的平均速度与时间",
   "C. 圆柱的底面积一定，圆柱的体积与高D. 长方形的周长一定，长方形相邻两边的长"
  ],
  "options": [
   "每天阅读半小时，阅读的总时长与天数",
   "50米短跑测试，跑步的平均速度与时间",
   "圆柱的底面积一定，圆柱的体积与高",
   "长方形的周长一定，长方形相邻两边的长"
  ],
  "optionParts": [
   [
    {
     "t": "text",
     "v": "每天阅读半小时，阅读的总时长与天数"
    }
   ],
   [
    {
     "t": "text",
     "v": "50米短跑测试，跑步的平均速度与时间"
    }
   ],
   [
    {
     "t": "text",
     "v": "圆柱的底面积一定，圆柱的体积与高"
    }
   ],
   [
    {
     "t": "text",
     "v": "长方形的周长一定，长方形相邻两边的长"
    }
   ]
  ],
  "key": 1,
  "answer": "50米短跑测试，跑步的平均速度与时间",
  "officialKey": "B"
 },
 {
  "id": "p2024-q8",
  "paperId": "p2024",
  "year": "2024—2025",
  "no": 8,
  "qtype": "single",
  "chapter": "ch-op",
  "cat": "新定义",
  "score": 2,
  "diff": "hard",
  "topic": "新定义运算",
  "name": "新定义运算（四个结论判断）",
  "bonus": false,
  "hasAnswer": true,
  "stemText": "对任意两个有理数⟨公式⟩如下运算：⟨公式⟩．有下列四个结论：⟨公式⟩①⟨公式⟩；②⟨公式⟩；③⟨公式⟩；④若⟨公式⟩，则⟨公式⟩．⟨公式⟩其中所有正确结论的序号是（   ）",
  "stemParts": [
   {
    "t": "text",
    "v": ""
   },
   {
    "t": "text",
    "v": "对任意两个有理数"
   },
   {
    "t": "img",
    "rid": "rId67",
    "src": "media/image34.png",
    "kind": "formula"
   },
   {
    "t": "text",
    "v": "如下运算："
   },
   {
    "t": "img",
    "rid": "rId69",
    "src": "media/image35.png",
    "kind": "formula"
   },
   {
    "t": "text",
    "v": "．有下列四个结论："
   },
   {
    "t": "break"
   },
   {
    "t": "text",
    "v": "①"
   },
   {
    "t": "img",
    "rid": "rId71",
    "src": "media/image36.png",
    "kind": "formula"
   },
   {
    "t": "text",
    "v": "；"
   },
   {
    "t": "text",
    "v": "②"
   },
   {
    "t": "img",
    "rid": "rId73",
    "src": "media/image37.png",
    "kind": "formula"
   },
   {
    "t": "text",
    "v": "；"
   },
   {
    "t": "text",
    "v": "③"
   },
   {
    "t": "img",
    "rid": "rId75",
    "src": "media/image38.png",
    "kind": "formula"
   },
   {
    "t": "text",
    "v": "；"
   },
   {
    "t": "text",
    "v": "④"
   },
   {
    "t": "text",
    "v": "若"
   },
   {
    "t": "img",
    "rid": "rId77",
    "src": "media/image39.png",
    "kind": "formula"
   },
   {
    "t": "text",
    "v": "，则"
   },
   {
    "t": "img",
    "rid": "rId79",
    "src": "media/image40.png",
    "kind": "formula"
   },
   {
    "t": "text",
    "v": "．"
   },
   {
    "t": "break"
   },
   {
    "t": "text",
    "v": "其中所有正确结论的序号是（"
   },
   {
    "t": "text",
    "v": "   "
   },
   {
    "t": "text",
    "v": "）"
   }
  ],
  "rawParas": [
   "8. 对任意两个有理数⟨公式⟩如下运算：⟨公式⟩．有下列四个结论：",
   "①⟨公式⟩；②⟨公式⟩；③⟨公式⟩；④若⟨公式⟩，则⟨公式⟩．",
   "其中所有正确结论的序号是（   ）",
   "A. ①②B. ③C. ①③D. ③④"
  ],
  "options": [
   "①②",
   "③",
   "①③",
   "③④"
  ],
  "optionParts": [
   [
    {
     "t": "text",
     "v": "①②"
    }
   ],
   [
    {
     "t": "text",
     "v": "③"
    }
   ],
   [
    {
     "t": "text",
     "v": "①③"
    }
   ],
   [
    {
     "t": "text",
     "v": "③④"
    }
   ]
  ],
  "key": 1,
  "answer": "③",
  "officialKey": "B"
 },
 {
  "id": "p2024-q9",
  "paperId": "p2024",
  "year": "2024—2025",
  "no": 9,
  "qtype": "calc",
  "chapter": "ch-rational",
  "cat": "概念",
  "score": 2,
  "diff": "easy",
  "topic": "绝对值",
  "name": "绝对值意义（最接近标准）",
  "bonus": false,
  "hasAnswer": true,
  "stemText": "检测某种零件的质量，将超过标准长度的毫米数记为正数．抽查4个零件的长度记录如下表所示，其中长度最接近标准长度的零件的编号是________号．⟨公式⟩零件编号⟨公式⟩1⟨公式⟩2⟨公式⟩3⟨公式⟩4⟨公式⟩长度/mm⟨公式⟩⟨公式⟩⟨公式⟩⟨公式⟩⟨公式⟩⟨公式⟩⟨公式⟩⟨公式⟩",
  "stemParts": [
   {
    "t": "text",
    "v": ""
   },
   {
    "t": "text",
    "v": "检测某种零件的质量，将超过标准长度的毫米数记为正数．抽查"
   },
   {
    "t": "text",
    "v": "4"
   },
   {
    "t": "text",
    "v": "个零件的长度记录如下表所示，其中长度最接近标准长度的零件的编号是"
   },
   {
    "t": "text",
    "v": "________"
   },
   {
    "t": "text",
    "v": "号．"
   },
   {
    "t": "break"
   },
   {
    "t": "text",
    "v": "零件编号"
   },
   {
    "t": "break"
   },
   {
    "t": "text",
    "v": "1"
   },
   {
    "t": "break"
   },
   {
    "t": "text",
    "v": "2"
   },
   {
    "t": "break"
   },
   {
    "t": "text",
    "v": "3"
   },
   {
    "t": "break"
   },
   {
    "t": "text",
    "v": "4"
   },
   {
    "t": "break"
   },
   {
    "t": "text",
    "v": "长度"
   },
   {
    "t": "text",
    "v": "/mm"
   },
   {
    "t": "break"
   },
   {
    "t": "img",
    "rid": "rId81",
    "src": "media/image41.png",
    "kind": "formula"
   },
   {
    "t": "break"
   },
   {
    "t": "img",
    "rid": "rId83",
    "src": "media/image42.png",
    "kind": "formula"
   },
   {
    "t": "break"
   },
   {
    "t": "img",
    "rid": "rId85",
    "src": "media/image43.png",
    "kind": "formula"
   },
   {
    "t": "break"
   },
   {
    "t": "img",
    "rid": "rId87",
    "src": "media/image44.png",
    "kind": "formula"
   }
  ],
  "rawParas": [
   "9. 检测某种零件的质量，将超过标准长度的毫米数记为正数．抽查4个零件的长度记录如下表所示，其中长度最接近标准长度的零件的编号是________号．",
   "零件编号",
   "1",
   "2",
   "3",
   "4",
   "长度/mm",
   "⟨公式⟩",
   "⟨公式⟩",
   "⟨公式⟩",
   "⟨公式⟩"
  ],
  "options": null,
  "optionParts": null,
  "key": null,
  "answer": "3",
  "accept": [
   "3"
  ],
  "officialKey": "3"
 },
 {
  "id": "p2024-q10",
  "paperId": "p2024",
  "year": "2024—2025",
  "no": 10,
  "qtype": "calc",
  "chapter": "ch-geo",
  "cat": "概念",
  "score": 2,
  "diff": "easy",
  "topic": "点线面概念",
  "name": "点与直线位置关系表述",
  "bonus": false,
  "hasAnswer": true,
  "stemText": "如图，已知点P与直线l，用适当的语句表述图中点P与直线l的关系：________．⟨公式⟩⟨公式⟩",
  "stemParts": [
   {
    "t": "text",
    "v": ""
   },
   {
    "t": "text",
    "v": "如图，已知点"
   },
   {
    "t": "text",
    "v": "P"
   },
   {
    "t": "text",
    "v": "与直线"
   },
   {
    "t": "text",
    "v": "l"
   },
   {
    "t": "text",
    "v": "，用适当的语句表述图中点"
   },
   {
    "t": "text",
    "v": "P"
   },
   {
    "t": "text",
    "v": "与直线"
   },
   {
    "t": "text",
    "v": "l"
   },
   {
    "t": "text",
    "v": "的关系："
   },
   {
    "t": "text",
    "v": "________"
   },
   {
    "t": "text",
    "v": "．"
   },
   {
    "t": "break"
   },
   {
    "t": "img",
    "rid": "rId89",
    "src": "media/image45.png",
    "kind": "figure"
   }
  ],
  "rawParas": [
   "10. 如图，已知点P与直线l，用适当的语句表述图中点P与直线l的关系：________．",
   "⟨公式⟩"
  ],
  "options": null,
  "optionParts": null,
  "key": null,
  "answer": "点P在直线l外",
  "accept": [
   "点P在直线l外"
  ],
  "officialKey": "点P在直线l外"
 },
 {
  "id": "p2024-q11",
  "paperId": "p2024",
  "year": "2024—2025",
  "no": 11,
  "qtype": "calc",
  "chapter": "ch-poly",
  "cat": "概念",
  "score": 2,
  "diff": "mid",
  "topic": "单项式概念（构造）",
  "name": "构造单项式（次数 4）",
  "bonus": false,
  "hasAnswer": true,
  "stemText": "写出一个次数是4的单项式，这个单项式可以是________（写出一个即可）．",
  "stemParts": [
   {
    "t": "text",
    "v": ""
   },
   {
    "t": "text",
    "v": "写出一个次数是"
   },
   {
    "t": "text",
    "v": "4"
   },
   {
    "t": "text",
    "v": "的单项式，这个单项式可以是"
   },
   {
    "t": "text",
    "v": "________"
   },
   {
    "t": "text",
    "v": "（写出一个即可）．"
   }
  ],
  "rawParas": [
   "11. 写出一个次数是4的单项式，这个单项式可以是________（写出一个即可）．"
  ],
  "options": null,
  "optionParts": null,
  "key": null,
  "answer": "（答案不唯一）",
  "openAnswer": true,
  "officialKey": "（答案不唯一）"
 },
 {
  "id": "p2024-q12",
  "paperId": "p2024",
  "year": "2024—2025",
  "no": 12,
  "qtype": "calc",
  "chapter": "ch-eq",
  "cat": "概念",
  "score": 2,
  "diff": "easy",
  "topic": "方程解求参数",
  "name": "方程解求参数",
  "bonus": false,
  "hasAnswer": true,
  "stemText": "若⟨公式⟩是关于x的方程⟨公式⟩的解，则k的值为________．",
  "stemParts": [
   {
    "t": "text",
    "v": ""
   },
   {
    "t": "text",
    "v": "若"
   },
   {
    "t": "img",
    "rid": "rId90",
    "src": "media/image46.png",
    "kind": "formula"
   },
   {
    "t": "text",
    "v": "是关于"
   },
   {
    "t": "text",
    "v": "x"
   },
   {
    "t": "text",
    "v": "的方程"
   },
   {
    "t": "img",
    "rid": "rId92",
    "src": "media/image47.png",
    "kind": "formula"
   },
   {
    "t": "text",
    "v": "的解，则"
   },
   {
    "t": "text",
    "v": "k"
   },
   {
    "t": "text",
    "v": "的值为"
   },
   {
    "t": "text",
    "v": "________"
   },
   {
    "t": "text",
    "v": "．"
   }
  ],
  "rawParas": [
   "12. 若⟨公式⟩是关于x的方程⟨公式⟩的解，则k的值为________．"
  ],
  "options": null,
  "optionParts": null,
  "key": null,
  "answer": "6",
  "accept": [
   "6"
  ],
  "officialKey": "6"
 },
 {
  "id": "p2024-q13",
  "paperId": "p2024",
  "year": "2024—2025",
  "no": 13,
  "qtype": "calc",
  "chapter": "ch-geo",
  "cat": "计算",
  "score": 2,
  "diff": "mid",
  "topic": "角的和差计算",
  "name": "角的和差",
  "bonus": false,
  "hasAnswer": true,
  "stemText": "如图，⟨公式⟩，⟨公式⟩，⟨公式⟩，则⟨公式⟩的度数为________°⟨公式⟩⟨公式⟩",
  "stemParts": [
   {
    "t": "text",
    "v": ""
   },
   {
    "t": "text",
    "v": "如图，"
   },
   {
    "t": "img",
    "rid": "rId94",
    "src": "media/image48.png",
    "kind": "formula"
   },
   {
    "t": "text",
    "v": "，"
   },
   {
    "t": "img",
    "rid": "rId96",
    "src": "media/image49.png",
    "kind": "formula"
   },
   {
    "t": "text",
    "v": "，"
   },
   {
    "t": "img",
    "rid": "rId98",
    "src": "media/image50.png",
    "kind": "formula"
   },
   {
    "t": "text",
    "v": "，则"
   },
   {
    "t": "img",
    "rid": "rId100",
    "src": "media/image51.png",
    "kind": "formula"
   },
   {
    "t": "text",
    "v": "的度数为"
   },
   {
    "t": "text",
    "v": "________"
   },
   {
    "t": "text",
    "v": "°"
   },
   {
    "t": "break"
   },
   {
    "t": "img",
    "rid": "rId102",
    "src": "media/image52.png",
    "kind": "figure"
   }
  ],
  "rawParas": [
   "13. 如图，⟨公式⟩，⟨公式⟩，⟨公式⟩，则⟨公式⟩的度数为________°",
   "⟨公式⟩"
  ],
  "options": null,
  "optionParts": null,
  "key": null,
  "answer": "76",
  "accept": [
   "76"
  ],
  "officialKey": "76"
 },
 {
  "id": "p2024-q14",
  "paperId": "p2024",
  "year": "2024—2025",
  "no": 14,
  "qtype": "calc",
  "chapter": "ch-expr",
  "cat": "推理",
  "score": 2,
  "diff": "hard",
  "topic": "图形规律探究",
  "name": "图形规律（阴影正方形）",
  "bonus": false,
  "hasAnswer": true,
  "stemText": "如图，边长相等的小正方形组成一组有规律的图案，其中部分小正方形涂有阴影．按照这样的规律，第n个图案中涂有阴影的小正方形的个数为________（用含n的式子表示）．⟨公式⟩⟨公式⟩",
  "stemParts": [
   {
    "t": "text",
    "v": ""
   },
   {
    "t": "text",
    "v": "如图，边长相等的小正方形组成一组有规律的图案，其中部分小正方形涂有阴影．按照这样的规律，第"
   },
   {
    "t": "text",
    "v": "n"
   },
   {
    "t": "text",
    "v": "个图案中涂有阴影的小正方形的个数为"
   },
   {
    "t": "text",
    "v": "________"
   },
   {
    "t": "text",
    "v": "（用含"
   },
   {
    "t": "text",
    "v": "n"
   },
   {
    "t": "text",
    "v": "的式子表示）．"
   },
   {
    "t": "break"
   },
   {
    "t": "img",
    "rid": "rId103",
    "src": "media/image53.png",
    "kind": "figure"
   },
   {
    "t": "text",
    "v": "  "
   }
  ],
  "rawParas": [
   "14. 如图，边长相等的小正方形组成一组有规律的图案，其中部分小正方形涂有阴影．按照这样的规律，第n个图案中涂有阴影的小正方形的个数为________（用含n的式子表示）．",
   "⟨公式⟩"
  ],
  "options": null,
  "optionParts": null,
  "key": null,
  "answer": "3n+2",
  "accept": [
   "3n+2"
  ],
  "officialKey": "3n+2"
 },
 {
  "id": "p2024-q15",
  "paperId": "p2024",
  "year": "2024—2025",
  "no": 15,
  "qtype": "calc",
  "chapter": "ch-eq",
  "cat": "建模",
  "score": 2,
  "diff": "mid",
  "topic": "列代数式",
  "name": "列方程（劳动分配）",
  "bonus": false,
  "hasAnswer": true,
  "stemText": "在一次劳动课上，有⟨公式⟩名同学在甲处劳动，有⟨公式⟩名同学在乙处劳动．现在另调⟨公式⟩人也去这两处劳动，使得在甲处劳动的人数是在乙处劳动的人数的⟨公式⟩倍，应调往甲处多少人？如果设调往甲处⟨公式⟩人，那么依题意可列方程为________．",
  "stemParts": [
   {
    "t": "text",
    "v": ""
   },
   {
    "t": "text",
    "v": "在一次劳动课上，有"
   },
   {
    "t": "img",
    "rid": "rId104",
    "src": "media/image54.png",
    "kind": "formula"
   },
   {
    "t": "text",
    "v": "名同学在甲处劳动，有"
   },
   {
    "t": "img",
    "rid": "rId106",
    "src": "media/image55.png",
    "kind": "formula"
   },
   {
    "t": "text",
    "v": "名同学在乙处劳动．现在另调"
   },
   {
    "t": "img",
    "rid": "rId108",
    "src": "media/image56.png",
    "kind": "formula"
   },
   {
    "t": "text",
    "v": "人也去这两处劳动，使得在甲处劳动的人数是在乙处劳动的人数的"
   },
   {
    "t": "img",
    "rid": "rId110",
    "src": "media/image57.png",
    "kind": "formula"
   },
   {
    "t": "text",
    "v": "倍，应调往甲处多少人？如果设调往甲处"
   },
   {
    "t": "img",
    "rid": "rId112",
    "src": "media/image58.png",
    "kind": "formula"
   },
   {
    "t": "text",
    "v": "人，那么依题意可列方程为"
   },
   {
    "t": "text",
    "v": "________"
   },
   {
    "t": "text",
    "v": "．"
   }
  ],
  "rawParas": [
   "15. 在一次劳动课上，有⟨公式⟩名同学在甲处劳动，有⟨公式⟩名同学在乙处劳动．现在另调⟨公式⟩人也去这两处劳动，使得在甲处劳动的人数是在乙处劳动的人数的⟨公式⟩倍，应调往甲处多少人？如果设调往甲处⟨公式⟩人，那么依题意可列方程为________．"
  ],
  "options": null,
  "optionParts": null,
  "key": null,
  "answer": "35+x=2(21+25-x)",
  "accept": [
   "35+x=2(21+25-x)"
  ],
  "officialKey": "35+x=2(21+25-x)"
 },
 {
  "id": "p2024-q16",
  "paperId": "p2024",
  "year": "2024—2025",
  "no": 16,
  "qtype": "big",
  "chapter": "ch-op",
  "cat": "推理",
  "score": 2,
  "diff": "hard",
  "topic": "数字填图（幻方类）",
  "name": "幻圆（四数和相等）",
  "bonus": false,
  "hasAnswer": true,
  "stemText": "如图1，“幻圆”的八个“圆圈”中的数分别是1，2，3，4，5，6，7，8，大圆上、小圆上以及大圆的两条直径上的四个数的和都等于18．将⟨公式⟩，⟨公式⟩，⟨公式⟩，0，1，2，3，4这八个数分别填入图2的“幻圆”的八个“圆圈”中，使大圆上、小圆上以及大圆的两条直径上的四个数的和都相等，其中⟨公式⟩，1，4已填入如图所示的位置．⟨公式⟩（1）图2中x，y表示的这两个数的和为________；⟨公式⟩（2）将x，y表示的数以及剩余的三个数填入图2中（填出一种即可），从上往下依次为_____，____，____．⟨公式⟩⟨公式⟩⟨公式⟩解答应写出文字说明、演算步骤或证明过程．",
  "stemParts": [
   {
    "t": "text",
    "v": ""
   },
   {
    "t": "text",
    "v": "如图"
   },
   {
    "t": "text",
    "v": "1"
   },
   {
    "t": "text",
    "v": "，“幻圆”的八个“圆圈”中的数分别是"
   },
   {
    "t": "text",
    "v": "1"
   },
   {
    "t": "text",
    "v": "，"
   },
   {
    "t": "text",
    "v": "2"
   },
   {
    "t": "text",
    "v": "，"
   },
   {
    "t": "text",
    "v": "3"
   },
   {
    "t": "text",
    "v": "，"
   },
   {
    "t": "text",
    "v": "4"
   },
   {
    "t": "text",
    "v": "，"
   },
   {
    "t": "text",
    "v": "5"
   },
   {
    "t": "text",
    "v": "，"
   },
   {
    "t": "text",
    "v": "6"
   },
   {
    "t": "text",
    "v": "，"
   },
   {
    "t": "text",
    "v": "7"
   },
   {
    "t": "text",
    "v": "，"
   },
   {
    "t": "text",
    "v": "8"
   },
   {
    "t": "text",
    "v": "，大圆上、小圆上以及大圆的两条直径上的四个数的和都等于"
   },
   {
    "t": "text",
    "v": "18"
   },
   {
    "t": "text",
    "v": "．将"
   },
   {
    "t": "img",
    "rid": "rId37",
    "src": "media/image17.png",
    "kind": "formula"
   },
   {
    "t": "text",
    "v": "，"
   },
   {
    "t": "img",
    "rid": "rId115",
    "src": "media/image59.png",
    "kind": "formula"
   },
   {
    "t": "text",
    "v": "，"
   },
   {
    "t": "img",
    "rid": "rId117",
    "src": "media/image60.png",
    "kind": "formula"
   },
   {
    "t": "text",
    "v": "，"
   },
   {
    "t": "text",
    "v": "0"
   },
   {
    "t": "text",
    "v": "，"
   },
   {
    "t": "text",
    "v": "1"
   },
   {
    "t": "text",
    "v": "，"
   },
   {
    "t": "text",
    "v": "2"
   },
   {
    "t": "text",
    "v": "，"
   },
   {
    "t": "text",
    "v": "3"
   },
   {
    "t": "text",
    "v": "，"
   },
   {
    "t": "text",
    "v": "4"
   },
   {
    "t": "text",
    "v": "这八个数分别填入图"
   },
   {
    "t": "text",
    "v": "2"
   },
   {
    "t": "text",
    "v": "的“幻圆”的八个“圆圈”中，使大圆上、小圆上以及大圆的两条直径上的四个数的和都相等，其中"
   },
   {
    "t": "img",
    "rid": "rId117",
    "src": "media/image60.png",
    "kind": "formula"
   },
   {
    "t": "text",
    "v": "，"
   },
   {
    "t": "text",
    "v": "1"
   },
   {
    "t": "text",
    "v": "，"
   },
   {
    "t": "text",
    "v": "4"
   },
   {
    "t": "text",
    "v": "已填入如图所示的位置．"
   },
   {
    "t": "break"
   },
   {
    "t": "text",
    "v": "（"
   },
   {
    "t": "text",
    "v": "1"
   },
   {
    "t": "text",
    "v": "）图"
   },
   {
    "t": "text",
    "v": "2"
   },
   {
    "t": "text",
    "v": "中"
   },
   {
    "t": "text",
    "v": "x"
   },
   {
    "t": "text",
    "v": "，"
   },
   {
    "t": "text",
    "v": "y"
   },
   {
    "t": "text",
    "v": "表示的这两个数的和为"
   },
   {
    "t": "text",
    "v": "________"
   },
   {
    "t": "text",
    "v": "；"
   },
   {
    "t": "break"
   },
   {
    "t": "text",
    "v": "（"
   },
   {
    "t": "text",
    "v": "2"
   },
   {
    "t": "text",
    "v": "）将"
   },
   {
    "t": "text",
    "v": "x"
   },
   {
    "t": "text",
    "v": "，"
   },
   {
    "t": "text",
    "v": "y"
   },
   {
    "t": "text",
    "v": "表示的数以及剩余的三个数填入图"
   },
   {
    "t": "text",
    "v": "2"
   },
   {
    "t": "text",
    "v": "中（填出一种即可），从上往下依次为"
   },
   {
    "t": "text",
    "v": "_____"
   },
   {
    "t": "text",
    "v": "，"
   },
   {
    "t": "text",
    "v": "____"
   },
   {
    "t": "text",
    "v": "，"
   },
   {
    "t": "text",
    "v": "____"
   },
   {
    "t": "text",
    "v": "．"
   },
   {
    "t": "break"
   },
   {
    "t": "img",
    "rid": "rId120",
    "src": "media/image61.png",
    "kind": "figure"
   },
   {
    "t": "break"
   },
   {
    "t": "text",
    "v": "解答应写出文字说明、演算步骤或证明过程．"
   }
  ],
  "rawParas": [
   "16. 如图1，“幻圆”的八个“圆圈”中的数分别是1，2，3，4，5，6，7，8，大圆上、小圆上以及大圆的两条直径上的四个数的和都等于18．将⟨公式⟩，⟨公式⟩，⟨公式⟩，0，1，2，3，4这八个数分别填入图2的“幻圆”的八个“圆圈”中，使大圆上、小圆上以及大圆的两条直径上的四个数的和都相等，其中⟨公式⟩，1，4已填入如图所示的位置．",
   "（1）图2中x，y表示的这两个数的和为________；",
   "（2）将x，y表示的数以及剩余的三个数填入图2中（填出一种即可），从上往下依次为_____，____，____．",
   "⟨公式⟩",
   "解答应写出文字说明、演算步骤或证明过程．"
  ],
  "options": null,
  "optionParts": null,
  "key": null,
  "answer": null,
  "officialKey": "①.     ②.     ③.     ④."
 },
 {
  "id": "p2024-q17",
  "paperId": "p2024",
  "year": "2024—2025",
  "no": 17,
  "qtype": "big",
  "chapter": "ch-op",
  "cat": "计算",
  "score": 19,
  "diff": "mid",
  "topic": "有理数混合运算",
  "name": "有理数计算（4 小问）",
  "bonus": false,
  "hasAnswer": true,
  "stemText": "计算：⟨公式⟩（1）⟨公式⟩；⟨公式⟩（2）⟨公式⟩；⟨公式⟩（3）⟨公式⟩；⟨公式⟩（4）⟨公式⟩．",
  "stemParts": [
   {
    "t": "text",
    "v": ""
   },
   {
    "t": "text",
    "v": "计算："
   },
   {
    "t": "break"
   },
   {
    "t": "text",
    "v": "（1）"
   },
   {
    "t": "img",
    "rid": "rId121",
    "src": "media/image62.png",
    "kind": "formula"
   },
   {
    "t": "text",
    "v": "；"
   },
   {
    "t": "break"
   },
   {
    "t": "text",
    "v": "（2）"
   },
   {
    "t": "img",
    "rid": "rId123",
    "src": "media/image63.png",
    "kind": "formula"
   },
   {
    "t": "text",
    "v": "；"
   },
   {
    "t": "break"
   },
   {
    "t": "text",
    "v": "（3）"
   },
   {
    "t": "img",
    "rid": "rId125",
    "src": "media/image64.png",
    "kind": "formula"
   },
   {
    "t": "text",
    "v": "；"
   },
   {
    "t": "break"
   },
   {
    "t": "text",
    "v": "（4）"
   },
   {
    "t": "img",
    "rid": "rId127",
    "src": "media/image65.png",
    "kind": "formula"
   },
   {
    "t": "text",
    "v": "．"
   }
  ],
  "rawParas": [
   "17. 计算：",
   "（1）⟨公式⟩；",
   "（2）⟨公式⟩；",
   "（3）⟨公式⟩；",
   "（4）⟨公式⟩．"
  ],
  "options": null,
  "optionParts": null,
  "key": null,
  "answer": null,
  "officialKey": "（1）"
 },
 {
  "id": "p2024-q18",
  "paperId": "p2024",
  "year": "2024—2025",
  "no": 18,
  "qtype": "big",
  "chapter": "ch-poly",
  "cat": "计算",
  "score": 6,
  "diff": "mid",
  "topic": "整式化简求值",
  "name": "整式化简求值",
  "bonus": false,
  "hasAnswer": true,
  "stemText": "先化简，再求值：⟨公式⟩，其中⟨公式⟩，⟨公式⟩．",
  "stemParts": [
   {
    "t": "text",
    "v": ""
   },
   {
    "t": "text",
    "v": "先化简，再求值："
   },
   {
    "t": "img",
    "rid": "rId129",
    "src": "media/image66.png",
    "kind": "formula"
   },
   {
    "t": "text",
    "v": "，其中"
   },
   {
    "t": "img",
    "rid": "rId131",
    "src": "media/image67.png",
    "kind": "formula"
   },
   {
    "t": "text",
    "v": "，"
   },
   {
    "t": "img",
    "rid": "rId133",
    "src": "media/image68.png",
    "kind": "formula"
   },
   {
    "t": "text",
    "v": "．"
   }
  ],
  "rawParas": [
   "18. 先化简，再求值：⟨公式⟩，其中⟨公式⟩，⟨公式⟩．"
  ],
  "options": null,
  "optionParts": null,
  "key": null,
  "answer": null,
  "officialKey": "；"
 },
 {
  "id": "p2024-q19",
  "paperId": "p2024",
  "year": "2024—2025",
  "no": 19,
  "qtype": "big",
  "chapter": "ch-geo",
  "cat": "作图",
  "score": 6,
  "diff": "mid",
  "topic": "尺规作图与说理",
  "name": "尺规作图（线段）",
  "bonus": false,
  "hasAnswer": true,
  "stemText": "如图，已知线段a，b（⟨公式⟩），点A，M．⟨公式⟩⟨公式⟩⟨公式⟩（1）使用直尺和圆规，完成以下作图（保留作图痕迹）；⟨公式⟩①作直线⟨公式⟩；⟨公式⟩②在射线⟨公式⟩上作线段⟨公式⟩，使⟨公式⟩；⟨公式⟩③作线段⟨公式⟩，使点A是线段⟨公式⟩的中点．⟨公式⟩（2）若⟨公式⟩，⟨公式⟩，则（1）中线段⟨公式⟩的长为________⟨公式⟩．",
  "stemParts": [
   {
    "t": "text",
    "v": ""
   },
   {
    "t": "text",
    "v": "如图，已知线段"
   },
   {
    "t": "text",
    "v": "a"
   },
   {
    "t": "text",
    "v": "，"
   },
   {
    "t": "text",
    "v": "b"
   },
   {
    "t": "text",
    "v": "（"
   },
   {
    "t": "img",
    "rid": "rId135",
    "src": "media/image69.png",
    "kind": "formula"
   },
   {
    "t": "text",
    "v": "），点"
   },
   {
    "t": "text",
    "v": "A"
   },
   {
    "t": "text",
    "v": "，"
   },
   {
    "t": "text",
    "v": "M"
   },
   {
    "t": "text",
    "v": "．"
   },
   {
    "t": "break"
   },
   {
    "t": "img",
    "rid": "rId137",
    "src": "media/image70.png",
    "kind": "figure"
   },
   {
    "t": "break"
   },
   {
    "t": "text",
    "v": "（1）"
   },
   {
    "t": "text",
    "v": "使用直尺和圆规，完成以下作图（保留作图痕迹）；"
   },
   {
    "t": "break"
   },
   {
    "t": "text",
    "v": "①"
   },
   {
    "t": "text",
    "v": "作直线"
   },
   {
    "t": "img",
    "rid": "rId138",
    "src": "media/image71.png",
    "kind": "formula"
   },
   {
    "t": "text",
    "v": "；"
   },
   {
    "t": "break"
   },
   {
    "t": "text",
    "v": "②"
   },
   {
    "t": "text",
    "v": "在射线"
   },
   {
    "t": "img",
    "rid": "rId138",
    "src": "media/image71.png",
    "kind": "formula"
   },
   {
    "t": "text",
    "v": "上作线段"
   },
   {
    "t": "img",
    "rid": "rId141",
    "src": "media/image72.png",
    "kind": "formula"
   },
   {
    "t": "text",
    "v": "，使"
   },
   {
    "t": "img",
    "rid": "rId143",
    "src": "media/image73.png",
    "kind": "formula"
   },
   {
    "t": "text",
    "v": "；"
   },
   {
    "t": "break"
   },
   {
    "t": "text",
    "v": "③"
   },
   {
    "t": "text",
    "v": "作线段"
   },
   {
    "t": "img",
    "rid": "rId145",
    "src": "media/image74.png",
    "kind": "formula"
   },
   {
    "t": "text",
    "v": "，使点"
   },
   {
    "t": "text",
    "v": "A"
   },
   {
    "t": "text",
    "v": "是线段"
   },
   {
    "t": "img",
    "rid": "rId145",
    "src": "media/image74.png",
    "kind": "formula"
   },
   {
    "t": "text",
    "v": "的中点．"
   },
   {
    "t": "break"
   },
   {
    "t": "text",
    "v": "（2）"
   },
   {
    "t": "text",
    "v": "若"
   },
   {
    "t": "img",
    "rid": "rId148",
    "src": "media/image75.png",
    "kind": "formula"
   },
   {
    "t": "text",
    "v": "，"
   },
   {
    "t": "img",
    "rid": "rId150",
    "src": "media/image76.png",
    "kind": "formula"
   },
   {
    "t": "text",
    "v": "，则（"
   },
   {
    "t": "text",
    "v": "1"
   },
   {
    "t": "text",
    "v": "）中线段"
   },
   {
    "t": "img",
    "rid": "rId145",
    "src": "media/image74.png",
    "kind": "formula"
   },
   {
    "t": "text",
    "v": "的长为"
   },
   {
    "t": "text",
    "v": "________"
   },
   {
    "t": "img",
    "rid": "rId153",
    "src": "media/image77.png",
    "kind": "formula"
   },
   {
    "t": "text",
    "v": "．"
   }
  ],
  "rawParas": [
   "19. 如图，已知线段a，b（⟨公式⟩），点A，M．",
   "⟨公式⟩",
   "（1）使用直尺和圆规，完成以下作图（保留作图痕迹）；",
   "①作直线⟨公式⟩；",
   "②在射线⟨公式⟩上作线段⟨公式⟩，使⟨公式⟩；",
   "③作线段⟨公式⟩，使点A是线段⟨公式⟩的中点．",
   "（2）若⟨公式⟩，⟨公式⟩，则（1）中线段⟨公式⟩的长为________⟨公式⟩．"
  ],
  "options": null,
  "optionParts": null,
  "key": null,
  "answer": null,
  "officialKey": "（1）图形如图所示；"
 },
 {
  "id": "p2024-q20",
  "paperId": "p2024",
  "year": "2024—2025",
  "no": 20,
  "qtype": "big",
  "chapter": "ch-eq",
  "cat": "计算",
  "score": 12,
  "diff": "mid",
  "topic": "解一元一次方程",
  "name": "解方程（2 小问）",
  "bonus": false,
  "hasAnswer": true,
  "stemText": "解下列方程：⟨公式⟩（1）⟨公式⟩；⟨公式⟩（2）⟨公式⟩．",
  "stemParts": [
   {
    "t": "text",
    "v": ""
   },
   {
    "t": "text",
    "v": "解下列方程："
   },
   {
    "t": "break"
   },
   {
    "t": "text",
    "v": "（1）"
   },
   {
    "t": "img",
    "rid": "rId155",
    "src": "media/image78.png",
    "kind": "formula"
   },
   {
    "t": "text",
    "v": "；"
   },
   {
    "t": "break"
   },
   {
    "t": "text",
    "v": "（2）"
   },
   {
    "t": "img",
    "rid": "rId157",
    "src": "media/image79.png",
    "kind": "formula"
   },
   {
    "t": "text",
    "v": "．"
   }
  ],
  "rawParas": [
   "20. 解下列方程：",
   "（1）⟨公式⟩；",
   "（2）⟨公式⟩．"
  ],
  "options": null,
  "optionParts": null,
  "key": null,
  "answer": null,
  "officialKey": "（1）"
 },
 {
  "id": "p2024-q21",
  "paperId": "p2024",
  "year": "2024—2025",
  "no": 21,
  "qtype": "big",
  "chapter": "ch-eq",
  "cat": "建模",
  "score": 7,
  "diff": "mid",
  "topic": "方程应用（表格数据）",
  "name": "方程应用题（表格销售额）",
  "bonus": false,
  "hasAnswer": true,
  "stemText": "甲、乙、丙、丁四位志愿者参加某公益组织举办的义卖活动，负责帆布袋、冰箱贴、徽章三款商品的售卖．下表记录了他们售出商品的数量和总销售额的部分信息． 志愿者 帆布袋/个 冰箱贴/个 徽章/个 总销售额/元 / 甲 30 0 0 600 / 乙 18 7 0 465 / 丙 21 2 11 538 / 丁 12   443 （1）直接写出帆布袋、冰箱贴、徽章的单价；\n（2）如果丁售出的徽章数量比他售出的冰箱贴数量的 3 倍还多 1 个，那么丁售出冰箱贴和徽章各多少个？",
  "stemParts": [
   {
    "t": "text",
    "v": "甲、乙、丙、丁四位志愿者参加某公益组织举办的义卖活动，负责帆布袋、冰箱贴、徽章三款商品的售卖．下表记录了他们售出商品的数量和总销售额的部分信息．"
   },
   {
    "t": "break"
   },
   {
    "t": "table",
    "rows": [
     [
      "志愿者",
      "帆布袋/个",
      "冰箱贴/个",
      "徽章/个",
      "总销售额/元"
     ],
     [
      "甲",
      "30",
      "0",
      "0",
      "600"
     ],
     [
      "乙",
      "18",
      "7",
      "0",
      "465"
     ],
     [
      "丙",
      "21",
      "2",
      "11",
      "538"
     ],
     [
      "丁",
      "12",
      "",
      "",
      "443"
     ]
    ]
   },
   {
    "t": "break"
   },
   {
    "t": "text",
    "v": "（1）直接写出帆布袋、冰箱贴、徽章的单价；\n（2）如果丁售出的徽章数量比他售出的冰箱贴数量的 3 倍还多 1 个，那么丁售出冰箱贴和徽章各多少个？"
   }
  ],
  "rawParas": [
   "21. 甲、乙、丙、丁四位志愿者参加某公益组织举办的义卖活动，负责帆布袋、冰箱贴、徽章三款商品的售卖．下表记录了他们售出商品的数量和总销售额的部分信息．",
   "志愿者",
   "帆布袋/个",
   "冰箱贴/个",
   "徽章/个",
   "总销售额/元",
   "甲",
   "30",
   "0",
   "0",
   "600",
   "乙",
   "18",
   "7",
   "0",
   "465",
   "丙",
   "21",
   "2",
   "11",
   "538",
   "丁",
   "12",
   "443",
   "（1）直接写出帆布袋、冰箱贴、徽章的单价；",
   "（2）如果丁售出的徽章数量比他售出的冰箱贴数量的3倍还多1个，那么丁售出冰箱贴和徽章各多少个？"
  ],
  "options": null,
  "optionParts": null,
  "key": null,
  "answer": "（1）帆布袋、冰箱贴、徽章的单价分别是20元，15元，8元",
  "officialKey": "（1）帆布袋、冰箱贴、徽章的单价分别是20元，15元，8元"
 },
 {
  "id": "p2024-q22",
  "paperId": "p2024",
  "year": "2024—2025",
  "no": 22,
  "qtype": "big",
  "chapter": "ch-geo",
  "cat": "建模",
  "score": 5,
  "diff": "hard",
  "topic": "几何建模",
  "name": "U 形赛道（几何 + 代数）",
  "bonus": false,
  "hasAnswer": true,
  "stemText": "学校机器人社团计划开展自制机器人比赛，场地是长为⟨公式⟩，宽为⟨公式⟩的长方形，现需要设计赛道和比赛方案．如图1，小明在场地长为⟨公式⟩的一条边上截取线段⟨公式⟩，以⟨公式⟩为一边在场地内部画了一个小长方形，设计了一个宽都为⟨公式⟩的“U”形赛道（阴影部分），并制定了比赛方案．他将小长方形在场地内部的三条线段的和叫作赛道的内圈长．例如，图1中赛道的内圈长为线段⟨公式⟩，⟨公式⟩，⟨公式⟩的和．⟨公式⟩⟨公式⟩⟨公式⟩（1）用含x的式子表示：图1中，⟨公式⟩的长为_______⟨公式⟩，赛道的内圈长为______⟨公式⟩；⟨公式⟩（2）小明想到可以调整“U”形赛道的开口方向，如图2，他在场地长为⟨公式⟩的边⟨公式⟩上截取线段⟨公式⟩，且⟨公式⟩．他以⟨公式⟩为一边在场地内部画了一个小长方形，设计了一个宽都为⟨公式⟩的“U”形赛道．⟨公式⟩①请在图2中补全小明设计的赛道图形；⟨公式⟩②对于图2的这种设计，在图2和图1两种赛道的内圈长相同的前提下，如果这两种赛道宽度的差在⟨公式⟩范围内，那么可以直接使用之前制定的比赛方案，否则需要对比赛方案作出调整．判断使用图2的设计时，是否需要调整小明之前制定的比赛方案，并说明理由．",
  "stemParts": [
   {
    "t": "text",
    "v": ""
   },
   {
    "t": "text",
    "v": "学校机器人社团计划开展自制机器人比赛，场地是长为"
   },
   {
    "t": "img",
    "rid": "rId159",
    "src": "media/image80.png",
    "kind": "formula"
   },
   {
    "t": "text",
    "v": "，宽为"
   },
   {
    "t": "img",
    "rid": "rId161",
    "src": "media/image81.png",
    "kind": "formula"
   },
   {
    "t": "text",
    "v": "的长方形，现需要设计赛道和比赛方案．如图"
   },
   {
    "t": "text",
    "v": "1"
   },
   {
    "t": "text",
    "v": "，小明在场地长为"
   },
   {
    "t": "img",
    "rid": "rId159",
    "src": "media/image80.png",
    "kind": "formula"
   },
   {
    "t": "text",
    "v": "的一条边上截取线段"
   },
   {
    "t": "img",
    "rid": "rId141",
    "src": "media/image72.png",
    "kind": "formula"
   },
   {
    "t": "text",
    "v": "，以"
   },
   {
    "t": "img",
    "rid": "rId141",
    "src": "media/image72.png",
    "kind": "formula"
   },
   {
    "t": "text",
    "v": "为一边在场地内部画了一个小长方形，设计了一个宽都为"
   },
   {
    "t": "img",
    "rid": "rId166",
    "src": "media/image82.png",
    "kind": "formula"
   },
   {
    "t": "text",
    "v": "的“"
   },
   {
    "t": "text",
    "v": "U"
   },
   {
    "t": "text",
    "v": "”形赛道（阴影部分），并制定了比赛方案．他将小长方形在场地内部的三条线段的和叫作赛道的内圈长．例如，图"
   },
   {
    "t": "text",
    "v": "1"
   },
   {
    "t": "text",
    "v": "中赛道的内圈长为线段"
   },
   {
    "t": "img",
    "rid": "rId168",
    "src": "media/image83.png",
    "kind": "formula"
   },
   {
    "t": "text",
    "v": "，"
   },
   {
    "t": "img",
    "rid": "rId170",
    "src": "media/image84.png",
    "kind": "formula"
   },
   {
    "t": "text",
    "v": "，"
   },
   {
    "t": "img",
    "rid": "rId172",
    "src": "media/image85.png",
    "kind": "formula"
   },
   {
    "t": "text",
    "v": "的和．"
   },
   {
    "t": "break"
   },
   {
    "t": "img",
    "rid": "rId174",
    "src": "media/image86.png",
    "kind": "figure"
   },
   {
    "t": "break"
   },
   {
    "t": "text",
    "v": "（1）"
   },
   {
    "t": "text",
    "v": "用含"
   },
   {
    "t": "text",
    "v": "x"
   },
   {
    "t": "text",
    "v": "的式子表示：图"
   },
   {
    "t": "text",
    "v": "1"
   },
   {
    "t": "text",
    "v": "中，"
   },
   {
    "t": "img",
    "rid": "rId170",
    "src": "media/image84.png",
    "kind": "formula"
   },
   {
    "t": "text",
    "v": "的长为"
   },
   {
    "t": "text",
    "v": "_______"
   },
   {
    "t": "img",
    "rid": "rId153",
    "src": "media/image77.png",
    "kind": "formula"
   },
   {
    "t": "text",
    "v": "，赛道的内圈长为"
   },
   {
    "t": "text",
    "v": "______"
   },
   {
    "t": "img",
    "rid": "rId153",
    "src": "media/image77.png",
    "kind": "formula"
   },
   {
    "t": "text",
    "v": "；"
   },
   {
    "t": "break"
   },
   {
    "t": "text",
    "v": "（2）"
   },
   {
    "t": "text",
    "v": "小明想到可以调整“"
   },
   {
    "t": "text",
    "v": "U"
   },
   {
    "t": "text",
    "v": "”形赛道的开口方向，如图"
   },
   {
    "t": "text",
    "v": "2"
   },
   {
    "t": "text",
    "v": "，他在场地长为"
   },
   {
    "t": "img",
    "rid": "rId161",
    "src": "media/image81.png",
    "kind": "formula"
   },
   {
    "t": "text",
    "v": "的边"
   },
   {
    "t": "img",
    "rid": "rId179",
    "src": "media/image87.png",
    "kind": "formula"
   },
   {
    "t": "text",
    "v": "上截取线段"
   },
   {
    "t": "img",
    "rid": "rId181",
    "src": "media/image88.png",
    "kind": "formula"
   },
   {
    "t": "text",
    "v": "，且"
   },
   {
    "t": "img",
    "rid": "rId183",
    "src": "media/image89.png",
    "kind": "formula"
   },
   {
    "t": "text",
    "v": "．他以"
   },
   {
    "t": "img",
    "rid": "rId181",
    "src": "media/image88.png",
    "kind": "formula"
   },
   {
    "t": "text",
    "v": "为一边在场地内部画了一个小长方形，设计了一个宽都为"
   },
   {
    "t": "img",
    "rid": "rId186",
    "src": "media/image90.png",
    "kind": "formula"
   },
   {
    "t": "text",
    "v": "的“"
   },
   {
    "t": "text",
    "v": "U"
   },
   {
    "t": "text",
    "v": "”形赛道．"
   },
   {
    "t": "break"
   },
   {
    "t": "text",
    "v": "①"
   },
   {
    "t": "text",
    "v": "请在图"
   },
   {
    "t": "text",
    "v": "2"
   },
   {
    "t": "text",
    "v": "中补全小明设计的赛道图形；"
   },
   {
    "t": "break"
   },
   {
    "t": "text",
    "v": "②"
   },
   {
    "t": "text",
    "v": "对于图"
   },
   {
    "t": "text",
    "v": "2"
   },
   {
    "t": "text",
    "v": "的这种设计，在图"
   },
   {
    "t": "text",
    "v": "2"
   },
   {
    "t": "text",
    "v": "和图"
   },
   {
    "t": "text",
    "v": "1"
   },
   {
    "t": "text",
    "v": "两种赛道的内圈长相同的前提下，如果这两种赛道宽度的差在"
   },
   {
    "t": "img",
    "rid": "rId188",
    "src": "media/image91.png",
    "kind": "formula"
   },
   {
    "t": "text",
    "v": "范围内，那么可以直接使用之前制定的比赛方案，否则需要对比赛方案作出调整．判断使用图"
   },
   {
    "t": "text",
    "v": "2"
   },
   {
    "t": "text",
    "v": "的设计时，是否需要调整小明之前制定的比赛方案，并说明理由．"
   }
  ],
  "rawParas": [
   "22. 学校机器人社团计划开展自制机器人比赛，场地是长为⟨公式⟩，宽为⟨公式⟩的长方形，现需要设计赛道和比赛方案．如图1，小明在场地长为⟨公式⟩的一条边上截取线段⟨公式⟩，以⟨公式⟩为一边在场地内部画了一个小长方形，设计了一个宽都为⟨公式⟩的“U”形赛道（阴影部分），并制定了比赛方案．他将小长方形在场地内部的三条线段的和叫作赛道的内圈长．例如，图1中赛道的内圈长为线段⟨公式⟩，⟨公式⟩，⟨公式⟩的和．",
   "⟨公式⟩",
   "（1）用含x的式子表示：图1中，⟨公式⟩的长为_______⟨公式⟩，赛道的内圈长为______⟨公式⟩；",
   "（2）小明想到可以调整“U”形赛道的开口方向，如图2，他在场地长为⟨公式⟩的边⟨公式⟩上截取线段⟨公式⟩，且⟨公式⟩．他以⟨公式⟩为一边在场地内部画了一个小长方形，设计了一个宽都为⟨公式⟩的“U”形赛道．",
   "①请在图2中补全小明设计的赛道图形；",
   "②对于图2的这种设计，在图2和图1两种赛道的内圈长相同的前提下，如果这两种赛道宽度的差在⟨公式⟩范围内，那么可以直接使用之前制定的比赛方案，否则需要对比赛方案作出调整．判断使用图2的设计时，是否需要调整小明之前制定的比赛方案，并说明理由．"
  ],
  "options": null,
  "optionParts": null,
  "key": null,
  "answer": null,
  "officialKey": "（1），"
 },
 {
  "id": "p2024-q23",
  "paperId": "p2024",
  "year": "2024—2025",
  "no": 23,
  "qtype": "big",
  "chapter": "ch-rational",
  "cat": "分类",
  "score": 6,
  "diff": "top",
  "topic": "数轴动点与分类",
  "name": "数轴双动点（分段变速）",
  "bonus": false,
  "hasAnswer": true,
  "stemText": "如图，数轴上点A，O，B分别表示数⟨公式⟩，0，5．动点P从点A出发，以每秒1个单位长度的速度沿数轴正方向运动；同时动点Q从点B出发，以每秒1个单位长度的速度沿数轴负方向运动，并在经过点O后以每秒2个单位长度的速度继续沿数轴负方向运动；当点P到达点O时，P，Q两点都停止运动．设点P运动的时间为t秒．⟨公式⟩⟨公式⟩⟨公式⟩（1）当⟨公式⟩时，⟨公式⟩_______；当点P与点Q重合时，⟨公式⟩_______；⟨公式⟩（2）当点Q在点P左侧，且⟨公式⟩时，⟨公式⟩______，点Q表示的数是_______；⟨公式⟩（3）当⟨公式⟩时，求t的值．",
  "stemParts": [
   {
    "t": "text",
    "v": ""
   },
   {
    "t": "text",
    "v": "如图，数轴上点"
   },
   {
    "t": "text",
    "v": "A"
   },
   {
    "t": "text",
    "v": "，"
   },
   {
    "t": "text",
    "v": "O"
   },
   {
    "t": "text",
    "v": "，"
   },
   {
    "t": "text",
    "v": "B"
   },
   {
    "t": "text",
    "v": "分别表示数"
   },
   {
    "t": "img",
    "rid": "rId190",
    "src": "media/image92.png",
    "kind": "formula"
   },
   {
    "t": "text",
    "v": "，"
   },
   {
    "t": "text",
    "v": "0"
   },
   {
    "t": "text",
    "v": "，"
   },
   {
    "t": "text",
    "v": "5"
   },
   {
    "t": "text",
    "v": "．动点"
   },
   {
    "t": "text",
    "v": "P"
   },
   {
    "t": "text",
    "v": "从点"
   },
   {
    "t": "text",
    "v": "A"
   },
   {
    "t": "text",
    "v": "出发，以每秒"
   },
   {
    "t": "text",
    "v": "1"
   },
   {
    "t": "text",
    "v": "个单位长度的速度沿数轴正方向运动；同时动点"
   },
   {
    "t": "text",
    "v": "Q"
   },
   {
    "t": "text",
    "v": "从点"
   },
   {
    "t": "text",
    "v": "B"
   },
   {
    "t": "text",
    "v": "出发，以每秒"
   },
   {
    "t": "text",
    "v": "1"
   },
   {
    "t": "text",
    "v": "个单位长度的速度沿数轴负方向运动，并在经过点"
   },
   {
    "t": "text",
    "v": "O"
   },
   {
    "t": "text",
    "v": "后以每秒"
   },
   {
    "t": "text",
    "v": "2"
   },
   {
    "t": "text",
    "v": "个单位长度的速度继续沿数轴负方向运动；当点"
   },
   {
    "t": "text",
    "v": "P"
   },
   {
    "t": "text",
    "v": "到达点"
   },
   {
    "t": "text",
    "v": "O"
   },
   {
    "t": "text",
    "v": "时，"
   },
   {
    "t": "text",
    "v": "P"
   },
   {
    "t": "text",
    "v": "，"
   },
   {
    "t": "text",
    "v": "Q"
   },
   {
    "t": "text",
    "v": "两点都停止运动．设点"
   },
   {
    "t": "text",
    "v": "P"
   },
   {
    "t": "text",
    "v": "运动的时间为"
   },
   {
    "t": "text",
    "v": "t"
   },
   {
    "t": "text",
    "v": "秒．"
   },
   {
    "t": "break"
   },
   {
    "t": "img",
    "rid": "rId192",
    "src": "media/image93.png",
    "kind": "figure"
   },
   {
    "t": "break"
   },
   {
    "t": "text",
    "v": "（1）"
   },
   {
    "t": "text",
    "v": "当"
   },
   {
    "t": "img",
    "rid": "rId193",
    "src": "media/image94.png",
    "kind": "formula"
   },
   {
    "t": "text",
    "v": "时，"
   },
   {
    "t": "img",
    "rid": "rId195",
    "src": "media/image95.png",
    "kind": "formula"
   },
   {
    "t": "text",
    "v": "_______"
   },
   {
    "t": "text",
    "v": "；当点"
   },
   {
    "t": "text",
    "v": "P"
   },
   {
    "t": "text",
    "v": "与点"
   },
   {
    "t": "text",
    "v": "Q"
   },
   {
    "t": "text",
    "v": "重合时，"
   },
   {
    "t": "img",
    "rid": "rId197",
    "src": "media/image96.png",
    "kind": "formula"
   },
   {
    "t": "text",
    "v": "_______"
   },
   {
    "t": "text",
    "v": "；"
   },
   {
    "t": "break"
   },
   {
    "t": "text",
    "v": "（2）"
   },
   {
    "t": "text",
    "v": "当点"
   },
   {
    "t": "text",
    "v": "Q"
   },
   {
    "t": "text",
    "v": "在点"
   },
   {
    "t": "text",
    "v": "P"
   },
   {
    "t": "text",
    "v": "左侧，且"
   },
   {
    "t": "img",
    "rid": "rId199",
    "src": "media/image97.png",
    "kind": "formula"
   },
   {
    "t": "text",
    "v": "时，"
   },
   {
    "t": "img",
    "rid": "rId197",
    "src": "media/image96.png",
    "kind": "formula"
   },
   {
    "t": "text",
    "v": "______"
   },
   {
    "t": "text",
    "v": "，点"
   },
   {
    "t": "text",
    "v": "Q"
   },
   {
    "t": "text",
    "v": "表示的数是"
   },
   {
    "t": "text",
    "v": "_______"
   },
   {
    "t": "text",
    "v": "；"
   },
   {
    "t": "break"
   },
   {
    "t": "text",
    "v": "（3）"
   },
   {
    "t": "text",
    "v": "当"
   },
   {
    "t": "img",
    "rid": "rId202",
    "src": "media/image98.png",
    "kind": "formula"
   },
   {
    "t": "text",
    "v": "时，求"
   },
   {
    "t": "text",
    "v": "t"
   },
   {
    "t": "text",
    "v": "的值．"
   }
  ],
  "rawParas": [
   "23. 如图，数轴上点A，O，B分别表示数⟨公式⟩，0，5．动点P从点A出发，以每秒1个单位长度的速度沿数轴正方向运动；同时动点Q从点B出发，以每秒1个单位长度的速度沿数轴负方向运动，并在经过点O后以每秒2个单位长度的速度继续沿数轴负方向运动；当点P到达点O时，P，Q两点都停止运动．设点P运动的时间为t秒．",
   "⟨公式⟩",
   "（1）当⟨公式⟩时，⟨公式⟩_______；当点P与点Q重合时，⟨公式⟩_______；",
   "（2）当点Q在点P左侧，且⟨公式⟩时，⟨公式⟩______，点Q表示的数是_______；",
   "（3）当⟨公式⟩时，求t的值．"
  ],
  "options": null,
  "optionParts": null,
  "key": null,
  "answer": "（1）3；6；",
  "officialKey": "（1）3；6；"
 },
 {
  "id": "p2024-q24",
  "paperId": "p2024",
  "year": "2024—2025",
  "no": 24,
  "qtype": "big",
  "chapter": "ch-geo",
  "cat": "分类",
  "score": 7,
  "diff": "top",
  "topic": "动角（旋转）",
  "name": "三角尺旋转 + 角平分线",
  "bonus": false,
  "hasAnswer": true,
  "stemText": "已知直线⟨公式⟩，从一副三角尺中任取一个，将其某一个锐角的顶点放置在直线⟨公式⟩上，并记为点A，该锐角的两边分别记为射线⟨公式⟩，射线⟨公式⟩，且字母A，B，C按顺时针方向排列（射线⟨公式⟩，⟨公式⟩不与直线⟨公式⟩重合）．作射线⟨公式⟩平分⟨公式⟩，射线⟨公式⟩平分⟨公式⟩．⟨公式⟩⟨公式⟩⟨公式⟩（1）如图1，若⟨公式⟩，⟨公式⟩，则⟨公式⟩_______°；⟨公式⟩（2）如图2，若⟨公式⟩，且⟨公式⟩与⟨公式⟩互余，求⟨公式⟩的度数；⟨公式⟩（3）将三角尺绕点A旋转，使得射线⟨公式⟩，⟨公式⟩都在直线⟨公式⟩的下方，直接写出⟨公式⟩的度数的所有可能值．",
  "stemParts": [
   {
    "t": "text",
    "v": ""
   },
   {
    "t": "text",
    "v": "已知直线"
   },
   {
    "t": "img",
    "rid": "rId179",
    "src": "media/image87.png",
    "kind": "formula"
   },
   {
    "t": "text",
    "v": "，从一副三角尺中任取一个，将其某一个锐角的顶点放置在直线"
   },
   {
    "t": "img",
    "rid": "rId179",
    "src": "media/image87.png",
    "kind": "formula"
   },
   {
    "t": "text",
    "v": "上，并记为点"
   },
   {
    "t": "text",
    "v": "A"
   },
   {
    "t": "text",
    "v": "，该锐角的两边分别记为射线"
   },
   {
    "t": "img",
    "rid": "rId141",
    "src": "media/image72.png",
    "kind": "formula"
   },
   {
    "t": "text",
    "v": "，射线"
   },
   {
    "t": "img",
    "rid": "rId207",
    "src": "media/image99.png",
    "kind": "formula"
   },
   {
    "t": "text",
    "v": "，且字母"
   },
   {
    "t": "text",
    "v": "A"
   },
   {
    "t": "text",
    "v": "，"
   },
   {
    "t": "text",
    "v": "B"
   },
   {
    "t": "text",
    "v": "，"
   },
   {
    "t": "text",
    "v": "C"
   },
   {
    "t": "text",
    "v": "按顺时针方向排列（射线"
   },
   {
    "t": "img",
    "rid": "rId141",
    "src": "media/image72.png",
    "kind": "formula"
   },
   {
    "t": "text",
    "v": "，"
   },
   {
    "t": "img",
    "rid": "rId207",
    "src": "media/image99.png",
    "kind": "formula"
   },
   {
    "t": "text",
    "v": "不与直线"
   },
   {
    "t": "img",
    "rid": "rId179",
    "src": "media/image87.png",
    "kind": "formula"
   },
   {
    "t": "text",
    "v": "重合）．作射线"
   },
   {
    "t": "img",
    "rid": "rId168",
    "src": "media/image83.png",
    "kind": "formula"
   },
   {
    "t": "text",
    "v": "平分"
   },
   {
    "t": "img",
    "rid": "rId213",
    "src": "media/image100.png",
    "kind": "formula"
   },
   {
    "t": "text",
    "v": "，射线"
   },
   {
    "t": "img",
    "rid": "rId215",
    "src": "media/image101.png",
    "kind": "formula"
   },
   {
    "t": "text",
    "v": "平分"
   },
   {
    "t": "img",
    "rid": "rId217",
    "src": "media/image102.png",
    "kind": "formula"
   },
   {
    "t": "text",
    "v": "．"
   },
   {
    "t": "break"
   },
   {
    "t": "img",
    "rid": "rId219",
    "src": "media/image103.png",
    "kind": "figure"
   },
   {
    "t": "break"
   },
   {
    "t": "text",
    "v": "（1）"
   },
   {
    "t": "text",
    "v": "如图"
   },
   {
    "t": "text",
    "v": "1"
   },
   {
    "t": "text",
    "v": "，若"
   },
   {
    "t": "img",
    "rid": "rId220",
    "src": "media/image104.png",
    "kind": "formula"
   },
   {
    "t": "text",
    "v": "，"
   },
   {
    "t": "img",
    "rid": "rId222",
    "src": "media/image105.png",
    "kind": "formula"
   },
   {
    "t": "text",
    "v": "，则"
   },
   {
    "t": "img",
    "rid": "rId224",
    "src": "media/image106.png",
    "kind": "formula"
   },
   {
    "t": "text",
    "v": "_______°"
   },
   {
    "t": "text",
    "v": "；"
   },
   {
    "t": "break"
   },
   {
    "t": "text",
    "v": "（2）"
   },
   {
    "t": "text",
    "v": "如图"
   },
   {
    "t": "text",
    "v": "2"
   },
   {
    "t": "text",
    "v": "，若"
   },
   {
    "t": "img",
    "rid": "rId226",
    "src": "media/image107.png",
    "kind": "formula"
   },
   {
    "t": "text",
    "v": "，且"
   },
   {
    "t": "img",
    "rid": "rId228",
    "src": "media/image108.png",
    "kind": "formula"
   },
   {
    "t": "text",
    "v": "与"
   },
   {
    "t": "img",
    "rid": "rId230",
    "src": "media/image109.png",
    "kind": "formula"
   },
   {
    "t": "text",
    "v": "互余，求"
   },
   {
    "t": "img",
    "rid": "rId232",
    "src": "media/image110.png",
    "kind": "formula"
   },
   {
    "t": "text",
    "v": "的度数；"
   },
   {
    "t": "break"
   },
   {
    "t": "text",
    "v": "（3）"
   },
   {
    "t": "text",
    "v": "将三角尺绕点"
   },
   {
    "t": "text",
    "v": "A"
   },
   {
    "t": "text",
    "v": "旋转，使得射线"
   },
   {
    "t": "img",
    "rid": "rId168",
    "src": "media/image83.png",
    "kind": "formula"
   },
   {
    "t": "text",
    "v": "，"
   },
   {
    "t": "img",
    "rid": "rId215",
    "src": "media/image101.png",
    "kind": "formula"
   },
   {
    "t": "text",
    "v": "都在直线"
   },
   {
    "t": "img",
    "rid": "rId179",
    "src": "media/image87.png",
    "kind": "formula"
   },
   {
    "t": "text",
    "v": "的下方，直接写出"
   },
   {
    "t": "img",
    "rid": "rId237",
    "src": "media/image111.png",
    "kind": "formula"
   },
   {
    "t": "text",
    "v": "的度数的所有可能值．"
   }
  ],
  "rawParas": [
   "24. 已知直线⟨公式⟩，从一副三角尺中任取一个，将其某一个锐角的顶点放置在直线⟨公式⟩上，并记为点A，该锐角的两边分别记为射线⟨公式⟩，射线⟨公式⟩，且字母A，B，C按顺时针方向排列（射线⟨公式⟩，⟨公式⟩不与直线⟨公式⟩重合）．作射线⟨公式⟩平分⟨公式⟩，射线⟨公式⟩平分⟨公式⟩．",
   "⟨公式⟩",
   "（1）如图1，若⟨公式⟩，⟨公式⟩，则⟨公式⟩_______°；",
   "（2）如图2，若⟨公式⟩，且⟨公式⟩与⟨公式⟩互余，求⟨公式⟩的度数；",
   "（3）将三角尺绕点A旋转，使得射线⟨公式⟩，⟨公式⟩都在直线⟨公式⟩的下方，直接写出⟨公式⟩的度数的所有可能值．"
  ],
  "options": null,
  "optionParts": null,
  "key": null,
  "answer": null,
  "officialKey": "（1）"
 },
 {
  "id": "p2024-q25",
  "paperId": "p2024",
  "year": "2024—2025",
  "no": 25,
  "qtype": "big",
  "chapter": "ch-op",
  "cat": "新定义",
  "score": 4,
  "diff": "hard",
  "topic": "进位制（综合与实践）",
  "name": "三进制转换（进位制）",
  "bonus": true,
  "hasAnswer": true,
  "stemText": "进位制是人们为了记数和运算方便而约定的记数系统．约定逢三进一就是三进制，用数字⟨公式⟩，⟨公式⟩，⟨公式⟩记数，三进制数可以转换为十进制数．例如，三进制数⟨公式⟩记为⟨公式⟩，由⟨公式⟩，可得⟨公式⟩是十进制数⟨公式⟩．⟨公式⟩（1）将⟨公式⟩转换为十进制数，结果是________；⟨公式⟩（2）对于一个用三进制表示的正整数，有下列两个结论：⟨公式⟩⟨公式⟩如果这个数的末位数字能被⟨公式⟩整除，那么这个数就能被⟨公式⟩整除；⟨公式⟩⟨公式⟩如果这个数的所有数位上的数字之和能被⟨公式⟩整除，那么这个数就能被⟨公式⟩整除．⟨公式⟩从中选出正确结论，并以四位的三进制数⟨公式⟩为例，说明该结论正确的道理．",
  "stemParts": [
   {
    "t": "text",
    "v": ""
   },
   {
    "t": "text",
    "v": "进位制是人们为了记数和运算方便而约定的记数系统．约定逢三进一就是三进制，用数字"
   },
   {
    "t": "img",
    "rid": "rId239",
    "src": "media/image112.png",
    "kind": "formula"
   },
   {
    "t": "text",
    "v": "，"
   },
   {
    "t": "img",
    "rid": "rId241",
    "src": "media/image113.png",
    "kind": "formula"
   },
   {
    "t": "text",
    "v": "，"
   },
   {
    "t": "img",
    "rid": "rId110",
    "src": "media/image57.png",
    "kind": "formula"
   },
   {
    "t": "text",
    "v": "记数，三进制数可以转换为十进制数．例如，三进制数"
   },
   {
    "t": "img",
    "rid": "rId244",
    "src": "media/image114.png",
    "kind": "formula"
   },
   {
    "t": "text",
    "v": "记为"
   },
   {
    "t": "img",
    "rid": "rId246",
    "src": "media/image115.png",
    "kind": "formula"
   },
   {
    "t": "text",
    "v": "，由"
   },
   {
    "t": "img",
    "rid": "rId248",
    "src": "media/image116.png",
    "kind": "formula"
   },
   {
    "t": "text",
    "v": "，可得"
   },
   {
    "t": "img",
    "rid": "rId246",
    "src": "media/image115.png",
    "kind": "formula"
   },
   {
    "t": "text",
    "v": "是十进制数"
   },
   {
    "t": "img",
    "rid": "rId251",
    "src": "media/image117.png",
    "kind": "formula"
   },
   {
    "t": "text",
    "v": "．"
   },
   {
    "t": "break"
   },
   {
    "t": "text",
    "v": "（1）"
   },
   {
    "t": "text",
    "v": "将"
   },
   {
    "t": "img",
    "rid": "rId253",
    "src": "media/image118.png",
    "kind": "formula"
   },
   {
    "t": "text",
    "v": "转换为十进制数，结果是"
   },
   {
    "t": "text",
    "v": "________"
   },
   {
    "t": "text",
    "v": "；"
   },
   {
    "t": "break"
   },
   {
    "t": "text",
    "v": "（2）"
   },
   {
    "t": "text",
    "v": "对于一个用三进制表示的正整数，有下列两个结论："
   },
   {
    "t": "break"
   },
   {
    "t": "img",
    "rid": "rId255",
    "src": "media/image119.png",
    "kind": "formula"
   },
   {
    "t": "text",
    "v": "如果这个数的末位数字能被"
   },
   {
    "t": "img",
    "rid": "rId110",
    "src": "media/image57.png",
    "kind": "formula"
   },
   {
    "t": "text",
    "v": "整除，那么这个数就能被"
   },
   {
    "t": "img",
    "rid": "rId110",
    "src": "media/image57.png",
    "kind": "formula"
   },
   {
    "t": "text",
    "v": "整除；"
   },
   {
    "t": "break"
   },
   {
    "t": "img",
    "rid": "rId259",
    "src": "media/image120.png",
    "kind": "formula"
   },
   {
    "t": "text",
    "v": "如果这个数的所有数位上的数字之和能被"
   },
   {
    "t": "img",
    "rid": "rId110",
    "src": "media/image57.png",
    "kind": "formula"
   },
   {
    "t": "text",
    "v": "整除，那么这个数就能被"
   },
   {
    "t": "img",
    "rid": "rId110",
    "src": "media/image57.png",
    "kind": "formula"
   },
   {
    "t": "text",
    "v": "整除．"
   },
   {
    "t": "break"
   },
   {
    "t": "text",
    "v": "从中选出正确结论，并以四位的三进制数"
   },
   {
    "t": "img",
    "rid": "rId263",
    "src": "media/image121.png",
    "kind": "formula"
   },
   {
    "t": "text",
    "v": "为例，说明该结论正确的道理．"
   }
  ],
  "rawParas": [
   "25. 进位制是人们为了记数和运算方便而约定的记数系统．约定逢三进一就是三进制，用数字⟨公式⟩，⟨公式⟩，⟨公式⟩记数，三进制数可以转换为十进制数．例如，三进制数⟨公式⟩记为⟨公式⟩，由⟨公式⟩，可得⟨公式⟩是十进制数⟨公式⟩．",
   "（1）将⟨公式⟩转换为十进制数，结果是________；",
   "（2）对于一个用三进制表示的正整数，有下列两个结论：",
   "⟨公式⟩如果这个数的末位数字能被⟨公式⟩整除，那么这个数就能被⟨公式⟩整除；",
   "⟨公式⟩如果这个数的所有数位上的数字之和能被⟨公式⟩整除，那么这个数就能被⟨公式⟩整除．",
   "从中选出正确结论，并以四位的三进制数⟨公式⟩为例，说明该结论正确的道理．"
  ],
  "options": null,
  "optionParts": null,
  "key": null,
  "answer": null,
  "officialKey": "（1）"
 },
 {
  "id": "p2024-q26",
  "paperId": "p2024",
  "year": "2024—2025",
  "no": 26,
  "qtype": "big",
  "chapter": "ch-rational",
  "cat": "新定义",
  "score": 6,
  "diff": "top",
  "topic": "新定义（数轴类）",
  "name": "新定义「平衡点」",
  "bonus": true,
  "hasAnswer": true,
  "stemText": "数轴上点A，B，M分别表示数a，b，m，如果a，b，m满足⟨公式⟩，则称点A，B互为关于点M的“平衡点”．例如，当⟨公式⟩，⟨公式⟩，⟨公式⟩时，点A，B互为关于点M的“平衡点”．⟨公式⟩已知数轴上点P表示数⟨公式⟩．⟨公式⟩（1）点A，B分别表示数a，b，且点A，B互为关于点P的“平衡点”，则⟨公式⟩________（用含a的式子表示）；⟨公式⟩（2）点O，C，D分别表示数0，1，6．⟨公式⟩对点C做如下操作：点C关于点P的“平衡点”为点⟨公式⟩，点⟨公式⟩关于点O的“平衡点”为点⟨公式⟩，点⟨公式⟩关于点P的“平衡点”为点⟨公式⟩，点⟨公式⟩关于点O的“平衡点”为点⟨公式⟩，按此方式继续操作，得到点⟨公式⟩，⟨公式⟩，…，⟨公式⟩（n为正整数）．⟨公式⟩对点D做如下操作：将点D沿数轴负方向移动k（⟨公式⟩）个单位长度得到点⟨公式⟩，点⟨公式⟩关于点P的“平衡点”为点⟨公式⟩，将点⟨公式⟩沿数轴负方向移动k个单位长度得到点⟨公式⟩，点⟨公式⟩关于点P的“平衡点”为点⟨公式⟩，按此方式继续操作，得到点⟨公式⟩，⟨公式⟩，…，⟨公式⟩．⟨公式⟩①求线段⟨公式⟩的长；⟨公式⟩②是否存在正整数n，对于任意的正数k，都有线段⟨公式⟩的长为667？如果存在，直接写出n的值；如果不存在，说明理由．",
  "stemParts": [
   {
    "t": "text",
    "v": ""
   },
   {
    "t": "text",
    "v": "数轴上点"
   },
   {
    "t": "text",
    "v": "A"
   },
   {
    "t": "text",
    "v": "，"
   },
   {
    "t": "text",
    "v": "B"
   },
   {
    "t": "text",
    "v": "，"
   },
   {
    "t": "text",
    "v": "M"
   },
   {
    "t": "text",
    "v": "分别表示数"
   },
   {
    "t": "text",
    "v": "a"
   },
   {
    "t": "text",
    "v": "，"
   },
   {
    "t": "text",
    "v": "b"
   },
   {
    "t": "text",
    "v": "，"
   },
   {
    "t": "text",
    "v": "m"
   },
   {
    "t": "text",
    "v": "，如果"
   },
   {
    "t": "text",
    "v": "a"
   },
   {
    "t": "text",
    "v": "，"
   },
   {
    "t": "text",
    "v": "b"
   },
   {
    "t": "text",
    "v": "，"
   },
   {
    "t": "text",
    "v": "m"
   },
   {
    "t": "text",
    "v": "满足"
   },
   {
    "t": "img",
    "rid": "rId265",
    "src": "media/image122.png",
    "kind": "formula"
   },
   {
    "t": "text",
    "v": "，则称点"
   },
   {
    "t": "text",
    "v": "A"
   },
   {
    "t": "text",
    "v": "，"
   },
   {
    "t": "text",
    "v": "B"
   },
   {
    "t": "text",
    "v": "互为关于点"
   },
   {
    "t": "text",
    "v": "M"
   },
   {
    "t": "text",
    "v": "的“平衡点”．例如，当"
   },
   {
    "t": "img",
    "rid": "rId267",
    "src": "media/image123.png",
    "kind": "formula"
   },
   {
    "t": "text",
    "v": "，"
   },
   {
    "t": "img",
    "rid": "rId269",
    "src": "media/image124.png",
    "kind": "formula"
   },
   {
    "t": "text",
    "v": "，"
   },
   {
    "t": "img",
    "rid": "rId271",
    "src": "media/image125.png",
    "kind": "formula"
   },
   {
    "t": "text",
    "v": "时，点"
   },
   {
    "t": "text",
    "v": "A"
   },
   {
    "t": "text",
    "v": "，"
   },
   {
    "t": "text",
    "v": "B"
   },
   {
    "t": "text",
    "v": "互为关于点"
   },
   {
    "t": "text",
    "v": "M"
   },
   {
    "t": "text",
    "v": "的“平衡点”．"
   },
   {
    "t": "break"
   },
   {
    "t": "text",
    "v": "已知数轴上点"
   },
   {
    "t": "text",
    "v": "P"
   },
   {
    "t": "text",
    "v": "表示数"
   },
   {
    "t": "img",
    "rid": "rId37",
    "src": "media/image17.png",
    "kind": "formula"
   },
   {
    "t": "text",
    "v": "．"
   },
   {
    "t": "break"
   },
   {
    "t": "text",
    "v": "（1）"
   },
   {
    "t": "text",
    "v": "点"
   },
   {
    "t": "text",
    "v": "A"
   },
   {
    "t": "text",
    "v": "，"
   },
   {
    "t": "text",
    "v": "B"
   },
   {
    "t": "text",
    "v": "分别表示数"
   },
   {
    "t": "text",
    "v": "a"
   },
   {
    "t": "text",
    "v": "，"
   },
   {
    "t": "text",
    "v": "b"
   },
   {
    "t": "text",
    "v": "，且点"
   },
   {
    "t": "text",
    "v": "A"
   },
   {
    "t": "text",
    "v": "，"
   },
   {
    "t": "text",
    "v": "B"
   },
   {
    "t": "text",
    "v": "互为关于点"
   },
   {
    "t": "text",
    "v": "P"
   },
   {
    "t": "text",
    "v": "的“平衡点”，则"
   },
   {
    "t": "img",
    "rid": "rId274",
    "src": "media/image126.png",
    "kind": "formula"
   },
   {
    "t": "text",
    "v": "________"
   },
   {
    "t": "text",
    "v": "（用含"
   },
   {
    "t": "text",
    "v": "a"
   },
   {
    "t": "text",
    "v": "的式子表示）；"
   },
   {
    "t": "break"
   },
   {
    "t": "text",
    "v": "（2）"
   },
   {
    "t": "text",
    "v": "点"
   },
   {
    "t": "text",
    "v": "O"
   },
   {
    "t": "text",
    "v": "，"
   },
   {
    "t": "text",
    "v": "C"
   },
   {
    "t": "text",
    "v": "，"
   },
   {
    "t": "text",
    "v": "D"
   },
   {
    "t": "text",
    "v": "分别表示数"
   },
   {
    "t": "text",
    "v": "0"
   },
   {
    "t": "text",
    "v": "，"
   },
   {
    "t": "text",
    "v": "1"
   },
   {
    "t": "text",
    "v": "，"
   },
   {
    "t": "text",
    "v": "6"
   },
   {
    "t": "text",
    "v": "．"
   },
   {
    "t": "break"
   },
   {
    "t": "text",
    "v": "对点"
   },
   {
    "t": "text",
    "v": "C"
   },
   {
    "t": "text",
    "v": "做如下操作：点"
   },
   {
    "t": "text",
    "v": "C"
   },
   {
    "t": "text",
    "v": "关于点"
   },
   {
    "t": "text",
    "v": "P"
   },
   {
    "t": "text",
    "v": "的“平衡点”为点"
   },
   {
    "t": "img",
    "rid": "rId276",
    "src": "media/image127.png",
    "kind": "formula"
   },
   {
    "t": "text",
    "v": "，点"
   },
   {
    "t": "img",
    "rid": "rId276",
    "src": "media/image127.png",
    "kind": "formula"
   },
   {
    "t": "text",
    "v": "关于点"
   },
   {
    "t": "text",
    "v": "O"
   },
   {
    "t": "text",
    "v": "的“平衡点”为点"
   },
   {
    "t": "img",
    "rid": "rId279",
    "src": "media/image128.png",
    "kind": "formula"
   },
   {
    "t": "text",
    "v": "，点"
   },
   {
    "t": "img",
    "rid": "rId279",
    "src": "media/image128.png",
    "kind": "formula"
   },
   {
    "t": "text",
    "v": "关于点"
   },
   {
    "t": "text",
    "v": "P"
   },
   {
    "t": "text",
    "v": "的“平衡点”为点"
   },
   {
    "t": "img",
    "rid": "rId282",
    "src": "media/image129.png",
    "kind": "formula"
   },
   {
    "t": "text",
    "v": "，点"
   },
   {
    "t": "img",
    "rid": "rId282",
    "src": "media/image129.png",
    "kind": "formula"
   },
   {
    "t": "text",
    "v": "关于点"
   },
   {
    "t": "text",
    "v": "O"
   },
   {
    "t": "text",
    "v": "的“平衡点”为点"
   },
   {
    "t": "img",
    "rid": "rId285",
    "src": "media/image130.png",
    "kind": "formula"
   },
   {
    "t": "text",
    "v": "，按此方式继续操作，得到点"
   },
   {
    "t": "img",
    "rid": "rId287",
    "src": "media/image131.png",
    "kind": "formula"
   },
   {
    "t": "text",
    "v": "，"
   },
   {
    "t": "img",
    "rid": "rId289",
    "src": "media/image132.png",
    "kind": "formula"
   },
   {
    "t": "text",
    "v": "，"
   },
   {
    "t": "text",
    "v": "…"
   },
   {
    "t": "text",
    "v": "，"
   },
   {
    "t": "img",
    "rid": "rId291",
    "src": "media/image133.png",
    "kind": "formula"
   },
   {
    "t": "text",
    "v": "（"
   },
   {
    "t": "text",
    "v": "n"
   },
   {
    "t": "text",
    "v": "为正整数）．"
   },
   {
    "t": "break"
   },
   {
    "t": "text",
    "v": "对点"
   },
   {
    "t": "text",
    "v": "D"
   },
   {
    "t": "text",
    "v": "做如下操作：将点"
   },
   {
    "t": "text",
    "v": "D"
   },
   {
    "t": "text",
    "v": "沿数轴负方向移动"
   },
   {
    "t": "text",
    "v": "k"
   },
   {
    "t": "text",
    "v": "（"
   },
   {
    "t": "img",
    "rid": "rId293",
    "src": "media/image134.png",
    "kind": "formula"
   },
   {
    "t": "text",
    "v": "）个单位长度得到点"
   },
   {
    "t": "img",
    "rid": "rId295",
    "src": "media/image135.png",
    "kind": "formula"
   },
   {
    "t": "text",
    "v": "，点"
   },
   {
    "t": "img",
    "rid": "rId295",
    "src": "media/image135.png",
    "kind": "formula"
   },
   {
    "t": "text",
    "v": "关于点"
   },
   {
    "t": "text",
    "v": "P"
   },
   {
    "t": "text",
    "v": "的“平衡点”为点"
   },
   {
    "t": "img",
    "rid": "rId298",
    "src": "media/image136.png",
    "kind": "formula"
   },
   {
    "t": "text",
    "v": "，将点"
   },
   {
    "t": "img",
    "rid": "rId298",
    "src": "media/image136.png",
    "kind": "formula"
   },
   {
    "t": "text",
    "v": "沿数轴负方向移动"
   },
   {
    "t": "text",
    "v": "k"
   },
   {
    "t": "text",
    "v": "个单位长度得到点"
   },
   {
    "t": "img",
    "rid": "rId301",
    "src": "media/image137.png",
    "kind": "formula"
   },
   {
    "t": "text",
    "v": "，点"
   },
   {
    "t": "img",
    "rid": "rId301",
    "src": "media/image137.png",
    "kind": "formula"
   },
   {
    "t": "text",
    "v": "关于点"
   },
   {
    "t": "text",
    "v": "P"
   },
   {
    "t": "text",
    "v": "的“平衡点”为点"
   },
   {
    "t": "img",
    "rid": "rId304",
    "src": "media/image138.png",
    "kind": "formula"
   },
   {
    "t": "text",
    "v": "，按此方式继续操作，得到点"
   },
   {
    "t": "img",
    "rid": "rId306",
    "src": "media/image139.png",
    "kind": "formula"
   },
   {
    "t": "text",
    "v": "，"
   },
   {
    "t": "img",
    "rid": "rId308",
    "src": "media/image140.png",
    "kind": "formula"
   },
   {
    "t": "text",
    "v": "，"
   },
   {
    "t": "text",
    "v": "…"
   },
   {
    "t": "text",
    "v": "，"
   },
   {
    "t": "img",
    "rid": "rId310",
    "src": "media/image141.png",
    "kind": "formula"
   },
   {
    "t": "text",
    "v": "．"
   },
   {
    "t": "break"
   },
   {
    "t": "text",
    "v": "①求线段"
   },
   {
    "t": "img",
    "rid": "rId312",
    "src": "media/image142.png",
    "kind": "formula"
   },
   {
    "t": "text",
    "v": "的长；"
   },
   {
    "t": "break"
   },
   {
    "t": "text",
    "v": "②是否存在正整数"
   },
   {
    "t": "text",
    "v": "n"
   },
   {
    "t": "text",
    "v": "，对于任意的正数"
   },
   {
    "t": "text",
    "v": "k"
   },
   {
    "t": "text",
    "v": "，都有线段"
   },
   {
    "t": "img",
    "rid": "rId314",
    "src": "media/image143.png",
    "kind": "formula"
   },
   {
    "t": "text",
    "v": "的长为"
   },
   {
    "t": "text",
    "v": "667"
   },
   {
    "t": "text",
    "v": "？如果存在，直接写出"
   },
   {
    "t": "text",
    "v": "n"
   },
   {
    "t": "text",
    "v": "的值；如果不存在，说明理由．"
   }
  ],
  "rawParas": [
   "26. 数轴上点A，B，M分别表示数a，b，m，如果a，b，m满足⟨公式⟩，则称点A，B互为关于点M的“平衡点”．例如，当⟨公式⟩，⟨公式⟩，⟨公式⟩时，点A，B互为关于点M的“平衡点”．",
   "已知数轴上点P表示数⟨公式⟩．",
   "（1）点A，B分别表示数a，b，且点A，B互为关于点P的“平衡点”，则⟨公式⟩________（用含a的式子表示）；",
   "（2）点O，C，D分别表示数0，1，6．",
   "对点C做如下操作：点C关于点P的“平衡点”为点⟨公式⟩，点⟨公式⟩关于点O的“平衡点”为点⟨公式⟩，点⟨公式⟩关于点P的“平衡点”为点⟨公式⟩，点⟨公式⟩关于点O的“平衡点”为点⟨公式⟩，按此方式继续操作，得到点⟨公式⟩，⟨公式⟩，…，⟨公式⟩（n为正整数）．",
   "对点D做如下操作：将点D沿数轴负方向移动k（⟨公式⟩）个单位长度得到点⟨公式⟩，点⟨公式⟩关于点P的“平衡点”为点⟨公式⟩，将点⟨公式⟩沿数轴负方向移动k个单位长度得到点⟨公式⟩，点⟨公式⟩关于点P的“平衡点”为点⟨公式⟩，按此方式继续操作，得到点⟨公式⟩，⟨公式⟩，…，⟨公式⟩．",
   "①求线段⟨公式⟩的长；",
   "②是否存在正整数n，对于任意的正数k，都有线段⟨公式⟩的长为667？如果存在，直接写出n的值；如果不存在，说明理由．"
  ],
  "options": null,
  "optionParts": null,
  "key": null,
  "answer": null,
  "officialKey": "（1）"
 },
 {
  "id": "p2025-q1",
  "paperId": "p2025",
  "year": "2025—2026",
  "no": 1,
  "qtype": "single",
  "chapter": "ch-rational",
  "cat": "概念",
  "score": 2,
  "diff": "easy",
  "topic": "相反数",
  "name": "相反数",
  "bonus": false,
  "hasAnswer": true,
  "stemText": "﹣6 的相反数是（ ）",
  "stemParts": [
   {
    "t": "text",
    "v": "﹣6 的相反数是（ ）"
   }
  ],
  "rawParas": [
   "1．（2 分）·【易】﹣6 的相反数是（      ）",
   "A．﹣6         B．6                 C．﹣            D．"
  ],
  "options": [
   "﹣6",
   "6",
   "﹣",
   ""
  ],
  "optionParts": [
   [
    {
     "t": "text",
     "v": "﹣6"
    }
   ],
   [
    {
     "t": "text",
     "v": "6"
    }
   ],
   [
    {
     "t": "text",
     "v": "﹣"
    }
   ],
   [
    {
     "t": "text",
     "v": ""
    }
   ]
  ],
  "key": 1,
  "answer": "6",
  "officialKey": "B"
 },
 {
  "id": "p2025-q2",
  "paperId": "p2025",
  "year": "2025—2026",
  "no": 2,
  "qtype": "single",
  "chapter": "ch-op",
  "cat": "概念",
  "score": 2,
  "diff": "easy",
  "topic": "科学记数法",
  "name": "科学记数法",
  "bonus": false,
  "hasAnswer": true,
  "stemText": "2025 年 4 月 23 日，由中国科学院空间应用工程与技术中心、云南天文台和上海天文 台组成的科研团队，利用云南天文台 1.2 米望远镜新升级的近红外月球激光测距系统，成功探测到 DRO ﹣A 卫星单角锥反射器的激光回波信号，星地距离约 350000 公里．这是我国首次实现地月距离尺度的 卫星激光测距．将 350000 用科学记数法表示应为（ ）",
  "stemParts": [
   {
    "t": "text",
    "v": "2025 年 4 月 23 日，由中国科学院空间应用工程与技术中心、云南天文台和上海天文 台组成的科研团队，利用云南天文台 1.2 米望远镜新升级的近红外月球激光测距系统，成功探测到 DRO ﹣A 卫星单角锥反射器的激光回波信号，星地距离约 350000 公里．这是我国首次实现地月距离尺度的 卫星激光测距．将 350000 用科学记数法表示应为（ ）"
   }
  ],
  "rawParas": [
   "2．（2 分）·【易】2025 年 4 月 23 日，由中国科学院空间应用工程与技术中心、云南天文台和上海天文",
   "台组成的科研团队，利用云南天文台 1.2 米望远镜新升级的近红外月球激光测距系统，成功探测到 DRO",
   "﹣A 卫星单角锥反射器的激光回波信号，星地距离约 350000 公里．这是我国首次实现地月距离尺度的",
   "卫星激光测距．将 350000 用科学记数法表示应为（              ）",
   "A．0.35×106   B．3.5×105           C．3.5×104      D．35×104"
  ],
  "options": [
   "0.35×106",
   "3.5×105",
   "3.5×104",
   "35×104"
  ],
  "optionParts": [
   [
    {
     "t": "text",
     "v": "0.35×106"
    }
   ],
   [
    {
     "t": "text",
     "v": "3.5×105"
    }
   ],
   [
    {
     "t": "text",
     "v": "3.5×104"
    }
   ],
   [
    {
     "t": "text",
     "v": "35×104"
    }
   ]
  ],
  "key": 1,
  "answer": "3.5×105",
  "officialKey": "B"
 },
 {
  "id": "p2025-q3",
  "paperId": "p2025",
  "year": "2025—2026",
  "no": 3,
  "qtype": "single",
  "chapter": "ch-geo",
  "cat": "空间",
  "score": 2,
  "diff": "easy",
  "topic": "面动成体",
  "name": "平面图形旋转成立体",
  "bonus": false,
  "hasAnswer": true,
  "stemText": "将下列平面图形绕轴旋转一周，可以得到图中所示的立体图形的是（ ）",
  "stemParts": [
   {
    "t": "text",
    "v": "将下列平面图形绕轴旋转一周，可以得到图中所示的立体图形的是（ ）"
   },
   {
    "t": "break"
   },
   {
    "t": "img",
    "src": "media/q3-img-002.png",
    "kind": "figure"
   }
  ],
  "rawParas": [
   "3．（2 分）·【较易】将下列平面图形绕轴旋转一周，可以得到图中所示的立体图形的是（                  ）",
   "A．                               B．",
   "C．                               D．"
  ],
  "options": [
   "（图）",
   "（图）",
   "（图）",
   "（图）"
  ],
  "optionParts": [
   [
    {
     "t": "img",
     "src": "media/q3-img-003.png",
     "kind": "figure"
    }
   ],
   [
    {
     "t": "img",
     "src": "media/q3-img-004.png",
     "kind": "figure"
    }
   ],
   [
    {
     "t": "img",
     "src": "media/q3-img-005.png",
     "kind": "figure"
    }
   ],
   [
    {
     "t": "img",
     "src": "media/q3-img-006.png",
     "kind": "figure"
    }
   ]
  ],
  "key": 3,
  "answer": "（图）",
  "officialKey": "D"
 },
 {
  "id": "p2025-q4",
  "paperId": "p2025",
  "year": "2025—2026",
  "no": 4,
  "qtype": "single",
  "chapter": "ch-rational",
  "cat": "概念",
  "score": 2,
  "diff": "mid",
  "topic": "数轴读符号",
  "name": "数轴判断符号",
  "bonus": false,
  "hasAnswer": true,
  "stemText": "若有理数 a，b 在数轴上的对应点的位置如图所示．下列结论中正确的是（ ）",
  "stemParts": [
   {
    "t": "text",
    "v": "若有理数 a，b 在数轴上的对应点的位置如图所示．下列结论中正确的是（ ）"
   },
   {
    "t": "break"
   },
   {
    "t": "img",
    "src": "media/q4-img-007.png",
    "kind": "figure"
   }
  ],
  "rawParas": [
   "4．（2 分）·【较易】若有理数 a，b 在数轴上的对应点的位置如图所示．下列结论中正确的是（                 ）",
   "A．﹣a＜b       B．ab＞1              C．a﹣b＞0        D．a+b＞0"
  ],
  "options": [
   "﹣a＜b",
   "ab＞1",
   "a﹣b＞0",
   "a+b＞0"
  ],
  "optionParts": [
   [
    {
     "t": "text",
     "v": "﹣a＜b"
    }
   ],
   [
    {
     "t": "text",
     "v": "ab＞1"
    }
   ],
   [
    {
     "t": "text",
     "v": "a﹣b＞0"
    }
   ],
   [
    {
     "t": "text",
     "v": "a+b＞0"
    }
   ]
  ],
  "key": 2,
  "answer": "a﹣b＞0",
  "officialKey": "C"
 },
 {
  "id": "p2025-q5",
  "paperId": "p2025",
  "year": "2025—2026",
  "no": 5,
  "qtype": "single",
  "chapter": "ch-poly",
  "cat": "计算",
  "score": 2,
  "diff": "easy",
  "topic": "合并同类项辨析",
  "name": "整式加减辨析",
  "bonus": false,
  "hasAnswer": true,
  "stemText": "下列计算正确的是（ ）",
  "stemParts": [
   {
    "t": "text",
    "v": "下列计算正确的是（ ）"
   }
  ],
  "rawParas": [
   "5．（2 分）·【易】下列计算正确的是（          ）",
   "A．3a﹣a＝2                         B．2a2+a2＝3a4",
   "C．3ab﹣ba＝2ab                D．a2b﹣ab2＝0"
  ],
  "options": [
   "3a﹣a＝2",
   "2a2+a2＝3a4",
   "3ab﹣ba＝2ab",
   "a2b﹣ab2＝0"
  ],
  "optionParts": [
   [
    {
     "t": "text",
     "v": "3a﹣a＝2"
    }
   ],
   [
    {
     "t": "text",
     "v": "2a2+a2＝3a4"
    }
   ],
   [
    {
     "t": "text",
     "v": "3ab﹣ba＝2ab"
    }
   ],
   [
    {
     "t": "text",
     "v": "a2b﹣ab2＝0"
    }
   ]
  ],
  "key": 2,
  "answer": "3ab﹣ba＝2ab",
  "officialKey": "C"
 },
 {
  "id": "p2025-q6",
  "paperId": "p2025",
  "year": "2025—2026",
  "no": 6,
  "qtype": "single",
  "chapter": "ch-expr",
  "cat": "概念",
  "score": 2,
  "diff": "easy",
  "topic": "反比例关系",
  "name": "反比例关系判断",
  "bonus": false,
  "hasAnswer": true,
  "stemText": "下列各对相关联的量中，成反比例关系的是（ ）",
  "stemParts": [
   {
    "t": "text",
    "v": "下列各对相关联的量中，成反比例关系的是（ ）"
   }
  ],
  "rawParas": [
   "6．（2 分）·【易】下列各对相关联的量中，成反比例关系的是（            ）",
   "A．某班共有 40 名学生，该班参加艺术社团的人数和参加科技社团的人数",
   "B．长方形的周长一定，长方形的长和宽",
   "C．车间加工零件的时间一定，加工的零件总数和单位时间内加工的零件个数",
   "D．圆柱的体积为 10m3，这个圆柱的底面积和高"
  ],
  "options": [
   "某班共有 40 名学生，该班参加艺术社团的人数和参加科技社团的人数",
   "长方形的周长一定，长方形的长和宽",
   "车间加工零件的时间一定，加工的零件总数和单位时间内加工的零件个数",
   "圆柱的体积为 10m3，这个圆柱的底面积和高"
  ],
  "optionParts": [
   [
    {
     "t": "text",
     "v": "某班共有 40 名学生，该班参加艺术社团的人数和参加科技社团的人数"
    }
   ],
   [
    {
     "t": "text",
     "v": "长方形的周长一定，长方形的长和宽"
    }
   ],
   [
    {
     "t": "text",
     "v": "车间加工零件的时间一定，加工的零件总数和单位时间内加工的零件个数"
    }
   ],
   [
    {
     "t": "text",
     "v": "圆柱的体积为 10m3，这个圆柱的底面积和高"
    }
   ]
  ],
  "key": 3,
  "answer": "圆柱的体积为 10m3，这个圆柱的底面积和高",
  "officialKey": "D"
 },
 {
  "id": "p2025-q7",
  "paperId": "p2025",
  "year": "2025—2026",
  "no": 7,
  "qtype": "single",
  "chapter": "ch-eq",
  "cat": "建模",
  "score": 2,
  "diff": "mid",
  "topic": "方程应用（工程）",
  "name": "列方程（工程问题）",
  "bonus": false,
  "hasAnswer": true,
  "stemText": "整理一批图书，由一个人整理需要 60h 完成．现计划安排 8 人完成此项工作，在工 作一段时间后，接到通知需提前完成任务，因此增加了 4 人和他们一起工作，30min 后这项工作全部完 成．假设这些人的工作效率相同，设实际完成这项工作用了 xh，则根据题意可列方程为（ ）",
  "stemParts": [
   {
    "t": "text",
    "v": "整理一批图书，由一个人整理需要 60h 完成．现计划安排 8 人完成此项工作，在工 作一段时间后，接到通知需提前完成任务，因此增加了 4 人和他们一起工作，30min 后这项工作全部完 成．假设这些人的工作效率相同，设实际完成这项工作用了 xh，则根据题意可列方程为（ ）"
   }
  ],
  "rawParas": [
   "7．（2 分）·【较易】整理一批图书，由一个人整理需要 60h 完成．现计划安排 8 人完成此项工作，在工",
   "作一段时间后，接到通知需提前完成任务，因此增加了 4 人和他们一起工作，30min 后这项工作全部完",
   "成．假设这些人的工作效率相同，设实际完成这项工作用了 xh，则根据题意可列方程为（                    ）",
   "A．",
   "B．",
   "C．",
   "D．"
  ],
  "options": [
   "（图）",
   "（图）",
   "（图）",
   "（图）"
  ],
  "optionParts": [
   [
    {
     "t": "img",
     "src": "media/q7-opt-A.png",
     "kind": "option"
    }
   ],
   [
    {
     "t": "img",
     "src": "media/q7-opt-B.png",
     "kind": "option"
    }
   ],
   [
    {
     "t": "img",
     "src": "media/q7-opt-C.png",
     "kind": "option"
    }
   ],
   [
    {
     "t": "img",
     "src": "media/q7-opt-D.png",
     "kind": "option"
    }
   ]
  ],
  "key": 0,
  "answer": "（图）",
  "officialKey": "A"
 },
 {
  "id": "p2025-q8",
  "paperId": "p2025",
  "year": "2025—2026",
  "no": 8,
  "qtype": "single",
  "chapter": "ch-rational",
  "cat": "推理",
  "score": 2,
  "diff": "hard",
  "topic": "绝对值",
  "name": "数轴距离最值",
  "bonus": false,
  "hasAnswer": true,
  "stemText": "在数轴上，点 M，N 分别表示数 m，n，则 M，N 两点间的距离可表示为：MN＝|m﹣ n|．如图，点 A，B，C 分别表示﹣1，2，5，点 P 为数轴上任意一点，若 d＝PA﹣AB﹣PC，则下列结 论中正确的是（ ）",
  "stemParts": [
   {
    "t": "text",
    "v": "在数轴上，点 M，N 分别表示数 m，n，则 M，N 两点间的距离可表示为：MN＝|m﹣ n|．如图，点 A，B，C 分别表示﹣1，2，5，点 P 为数轴上任意一点，若 d＝PA﹣AB﹣PC，则下列结 论中正确的是（ ）"
   },
   {
    "t": "break"
   },
   {
    "t": "img",
    "rid": "figure",
    "src": "media/q8-f-002.png",
    "kind": "figure"
   }
  ],
  "rawParas": [
   "（2 分）·【中档】在数轴上，点 M，N 分别表示数 m，n，则 M，N 两点间的距离可表示为：MN＝|m﹣",
   "n|．如图，点 A，B，C 分别表示﹣1，2，5，点 P 为数轴上任意一点，若 d＝PA﹣AB﹣PC，则下列结",
   "论中正确的是（        ）",
   "A．d 的最大值为 6                 B．d 的最大值为 3",
   "C．d 的最小值为﹣3                 D．d 的最小值为﹣6"
  ],
  "options": [
   "d 的最大值为 6",
   "d 的最大值为 3",
   "d 的最小值为﹣3",
   "d 的最小值为﹣6"
  ],
  "optionParts": [
   [
    {
     "t": "text",
     "v": "d 的最大值为 6"
    }
   ],
   [
    {
     "t": "text",
     "v": "d 的最大值为 3"
    }
   ],
   [
    {
     "t": "text",
     "v": "d 的最小值为﹣3"
    }
   ],
   [
    {
     "t": "text",
     "v": "d 的最小值为﹣6"
    }
   ]
  ],
  "key": 1,
  "answer": "d 的最大值为 3",
  "officialKey": "B"
 },
 {
  "id": "p2025-q9",
  "paperId": "p2025",
  "year": "2025—2026",
  "no": 9,
  "qtype": "calc",
  "chapter": "ch-op",
  "cat": "概念",
  "score": 2,
  "diff": "easy",
  "topic": "近似数与精确度",
  "name": "四舍五入（精确到 0.001）",
  "bonus": false,
  "hasAnswer": true,
  "stemText": "用四舍五入法把 6.5378 精确到 0.001，所得到的近似数为 ．",
  "stemParts": [
   {
    "t": "text",
    "v": "用四舍五入法把 6.5378 精确到 0.001，所得到的近似数为 ．"
   }
  ],
  "rawParas": [
   "9．（2 分）·【易】用四舍五入法把 6.5378 精确到 0.001，所得到的近似数为              ．"
  ],
  "options": null,
  "optionParts": null,
  "key": null,
  "answer": "6.538",
  "accept": [
   "6.538"
  ],
  "officialKey": "6.538"
 },
 {
  "id": "p2025-q10",
  "paperId": "p2025",
  "year": "2025—2026",
  "no": 10,
  "qtype": "calc",
  "chapter": "ch-rational",
  "cat": "概念",
  "score": 2,
  "diff": "easy",
  "topic": "数轴读符号",
  "name": "有理数比较大小",
  "bonus": false,
  "hasAnswer": true,
  "stemText": "比较大小： （填“＞”“＜”或“＝”）．",
  "stemParts": [
   {
    "t": "text",
    "v": "比较大小： （填“＞”“＜”或“＝”）．"
   }
  ],
  "rawParas": [
   "10．（2 分）·【易】比较大小：             （填“＞”“＜”或“＝”）．"
  ],
  "options": null,
  "optionParts": null,
  "key": null,
  "answer": "＞",
  "accept": [
   "＞"
  ],
  "officialKey": "＞"
 },
 {
  "id": "p2025-q11",
  "paperId": "p2025",
  "year": "2025—2026",
  "no": 11,
  "qtype": "calc",
  "chapter": "ch-poly",
  "cat": "概念",
  "score": 2,
  "diff": "mid",
  "topic": "单项式概念（构造）",
  "name": "单项式次数求参数",
  "bonus": false,
  "hasAnswer": true,
  "stemText": "若单项式 是关于 x，y 的五次单项式，则 m+n＝ ．",
  "stemParts": [
   {
    "t": "text",
    "v": "若单项式 是关于 x，y 的五次单项式，则 m+n＝ ．"
   }
  ],
  "rawParas": [
   "11．（2 分）·【较易】若单项式         是关于 x，y 的五次单项式，则 m+n＝       ．"
  ],
  "options": null,
  "optionParts": null,
  "key": null,
  "answer": "5",
  "accept": [
   "5"
  ],
  "officialKey": "5"
 },
 {
  "id": "p2025-q12",
  "paperId": "p2025",
  "year": "2025—2026",
  "no": 12,
  "qtype": "calc",
  "chapter": "ch-eq",
  "cat": "概念",
  "score": 2,
  "diff": "easy",
  "topic": "方程解求参数",
  "name": "方程解求参数",
  "bonus": false,
  "hasAnswer": true,
  "stemText": "若 x＝2 是关于 x 的方程 3x﹣2k＝2 的解，则 k 的值为 ．",
  "stemParts": [
   {
    "t": "text",
    "v": "若 x＝2 是关于 x 的方程 3x﹣2k＝2 的解，则 k 的值为 ．"
   }
  ],
  "rawParas": [
   "12．（2 分）·【易】若 x＝2 是关于 x 的方程 3x﹣2k＝2 的解，则 k 的值为    ．"
  ],
  "options": null,
  "optionParts": null,
  "key": null,
  "answer": "2",
  "accept": [
   "2"
  ],
  "officialKey": "2"
 },
 {
  "id": "p2025-q13",
  "paperId": "p2025",
  "year": "2025—2026",
  "no": 13,
  "qtype": "calc",
  "chapter": "ch-geo",
  "cat": "计算",
  "score": 2,
  "diff": "mid",
  "topic": "角的和差计算",
  "name": "角的和差",
  "bonus": false,
  "hasAnswer": true,
  "stemText": "如图，∠BOC＝12°，∠COD＝62°，∠AOB＝3∠BOC，则∠AOD 的度数 为 °．",
  "stemParts": [
   {
    "t": "text",
    "v": "如图，∠BOC＝12°，∠COD＝62°，∠AOB＝3∠BOC，则∠AOD 的度数 为 °．"
   },
   {
    "t": "break"
   },
   {
    "t": "img",
    "src": "media/q13-img-034.png",
    "kind": "figure"
   }
  ],
  "rawParas": [
   "13．（2 分）·【较易】如图，∠BOC＝12°，∠COD＝62°，∠AOB＝3∠BOC，则∠AOD 的度数",
   "为         °．"
  ],
  "options": null,
  "optionParts": null,
  "key": null,
  "answer": "110",
  "accept": [
   "110"
  ],
  "officialKey": "110"
 },
 {
  "id": "p2025-q14",
  "paperId": "p2025",
  "year": "2025—2026",
  "no": 14,
  "qtype": "calc",
  "chapter": "ch-expr",
  "cat": "推理",
  "score": 2,
  "diff": "mid",
  "topic": "图形规律探究",
  "name": "图形规律（棋子）",
  "bonus": false,
  "hasAnswer": true,
  "stemText": "如图，用棋子摆出一组图形，按照这种方法摆下去，摆第 4 个图形，需要 个棋子，摆第 n 个图形需要 个棋子（用含 n 的式子表示）．",
  "stemParts": [
   {
    "t": "text",
    "v": "如图，用棋子摆出一组图形，按照这种方法摆下去，摆第 4 个图形，需要 个棋子，摆第 n 个图形需要 个棋子（用含 n 的式子表示）．"
   },
   {
    "t": "break"
   },
   {
    "t": "img",
    "src": "media/q14-img-035.png",
    "kind": "figure"
   }
  ],
  "rawParas": [
   "14．（2 分）·【较易】如图，用棋子摆出一组图形，按照这种方法摆下去，摆第 4 个图形，需要",
   "个棋子，摆第 n 个图形需要                           个棋子（用含 n 的式子表示）．"
  ],
  "options": null,
  "optionParts": null,
  "key": null,
  "answer": "17，（3n+5）",
  "accept": [
   "17，（3n+5）"
  ],
  "officialKey": "17，（3n+5）"
 },
 {
  "id": "p2025-q15",
  "paperId": "p2025",
  "year": "2025—2026",
  "no": 15,
  "qtype": "calc",
  "chapter": "ch-op",
  "cat": "推理",
  "score": 2,
  "diff": "mid",
  "topic": "进位制（综合与实践）",
  "name": "算筹记数（数学文化）",
  "bonus": false,
  "hasAnswer": true,
  "stemText": "算筹是我国古代广泛应用的一种运算工具，摆放方式分“纵式”摆放和“横式”摆 放，图案与数字的对应关系如下表．算筹记数的表示方法为：个位用纵式，十位用横式，百位再用纵式， 千位再用横式，万位再用纵式…，这样从右到左，纵横相间，以此类推．算筹也可以表示负数，表示方 法为：在个位上再斜向摆放一根算筹． 纵式 横式 数字 1 2 3 4 5 6 7 8 9 如：数字 823 所对应的图案为“ ”，则“ ”所表示的数是 ．",
  "stemParts": [
   {
    "t": "text",
    "v": "算筹是我国古代广泛应用的一种运算工具，摆放方式分“纵式”摆放和“横式”摆 放，图案与数字的对应关系如下表．算筹记数的表示方法为：个位用纵式，十位用横式，百位再用纵式， 千位再用横式，万位再用纵式…，这样从右到左，纵横相间，以此类推．算筹也可以表示负数，表示方 法为：在个位上再斜向摆放一根算筹． 纵式 横式 数字 1 2 3 4 5 6 7 8 9 如：数字 823 所对应的图案为“ ”，则“ ”所表示的数是 ．"
   },
   {
    "t": "break"
   },
   {
    "t": "img",
    "src": "media/q15-img-036.png",
    "kind": "figure"
   }
  ],
  "rawParas": [
   "（2 分）·【较易】算筹是我国古代广泛应用的一种运算工具，摆放方式分“纵式”摆放和“横式”摆",
   "放，图案与数字的对应关系如下表．算筹记数的表示方法为：个位用纵式，十位用横式，百位再用纵式，",
   "千位再用横式，万位再用纵式…，这样从右到左，纵横相间，以此类推．算筹也可以表示负数，表示方",
   "法为：在个位上再斜向摆放一根算筹．",
   "纵式",
   "横式",
   "数字 1   2   3   4   5   6   7   8   9",
   "如：数字 823 所对应的图案为“                        ”，则“          ”所表示的数是         ．"
  ],
  "options": null,
  "optionParts": null,
  "key": null,
  "answer": "﹣3672",
  "accept": [
   "﹣3672"
  ],
  "officialKey": "﹣3672"
 },
 {
  "id": "p2025-q16",
  "paperId": "p2025",
  "year": "2025—2026",
  "no": 16,
  "qtype": "calc",
  "chapter": "ch-op",
  "cat": "推理",
  "score": 2,
  "diff": "hard",
  "topic": "数字填图（幻方类）",
  "name": "数字填图（六边形）",
  "bonus": false,
  "hasAnswer": true,
  "stemText": "如图，该图案由十一个六边形和六个黑点组成．现将﹣4，﹣3，﹣2，﹣1，0，1， 2，3，4，5，6 这十一个数分别填入图中的十一个六边形中，使得每个黑点周围的三个数之和都相 等．若﹣4，2，6，x 已填入图中，位置如图所示，则 x 表示的数是 ；每个黑点周围的三个数 之和为 ．",
  "stemParts": [
   {
    "t": "text",
    "v": "如图，该图案由十一个六边形和六个黑点组成．现将﹣4，﹣3，﹣2，﹣1，0，1， 2，3，4，5，6 这十一个数分别填入图中的十一个六边形中，使得每个黑点周围的三个数之和都相 等．若﹣4，2，6，x 已填入图中，位置如图所示，则 x 表示的数是 ；每个黑点周围的三个数 之和为 ．"
   },
   {
    "t": "break"
   },
   {
    "t": "img",
    "src": "media/q16-img-038.png",
    "kind": "figure"
   }
  ],
  "rawParas": [
   "16．（2 分）·【中档】如图，该图案由十一个六边形和六个黑点组成．现将﹣4，﹣3，﹣2，﹣1，0，1，",
   "2，3，4，5，6 这十一个数分别填入图中的十一个六边形中，使得每个黑点周围的三个数之和都相",
   "等．若﹣4，2，6，x 已填入图中，位置如图所示，则 x 表示的数是                          ；每个黑点周围的三个数",
   "之和为            ．"
  ],
  "options": null,
  "optionParts": null,
  "key": null,
  "answer": "0，3",
  "accept": [
   "0，3"
  ],
  "officialKey": "0，3"
 },
 {
  "id": "p2025-q17",
  "paperId": "p2025",
  "year": "2025—2026",
  "no": 17,
  "qtype": "big",
  "chapter": "ch-op",
  "cat": "计算",
  "score": 20,
  "diff": "mid",
  "topic": "有理数混合运算",
  "name": "有理数计算（4 小问）",
  "bonus": false,
  "hasAnswer": false,
  "stemText": "计算： （1）﹣7+（+3）﹣（﹣4）+（﹣6）； （2） ； （3） ； （4） ．",
  "stemParts": [
   {
    "t": "text",
    "v": "计算： （1）﹣7+（+3）﹣（﹣4）+（﹣6）； （2） ； （3） ； （4） ．"
   }
  ],
  "rawParas": [
   "17．（20 分）·【较易】计算：",
   "（1）﹣7+（+3）﹣（﹣4）+（﹣6）；",
   "（2）               ；",
   "（3）                   ；",
   "（4）                   ．"
  ],
  "options": null,
  "optionParts": null,
  "key": null,
  "answer": null,
  "officialKey": null
 },
 {
  "id": "p2025-q18",
  "paperId": "p2025",
  "year": "2025—2026",
  "no": 18,
  "qtype": "big",
  "chapter": "ch-poly",
  "cat": "计算",
  "score": 6,
  "diff": "mid",
  "topic": "整式化简求值",
  "name": "整式化简求值",
  "bonus": false,
  "hasAnswer": false,
  "stemText": "先化简，再求值：10xy﹣3xy2﹣2（5xy﹣xy2），其中 x＝2，y＝﹣1．",
  "stemParts": [
   {
    "t": "text",
    "v": "先化简，再求值：10xy﹣3xy2﹣2（5xy﹣xy2），其中 x＝2，y＝﹣1．"
   }
  ],
  "rawParas": [
   "18．（6 分）·【易】先化简，再求值：10xy﹣3xy2﹣2（5xy﹣xy2），其中 x＝2，y＝﹣1．"
  ],
  "options": null,
  "optionParts": null,
  "key": null,
  "answer": null,
  "officialKey": null
 },
 {
  "id": "p2025-q19",
  "paperId": "p2025",
  "year": "2025—2026",
  "no": 19,
  "qtype": "big",
  "chapter": "ch-eq",
  "cat": "计算",
  "score": 12,
  "diff": "mid",
  "topic": "解一元一次方程",
  "name": "解方程（2 小问）",
  "bonus": false,
  "hasAnswer": false,
  "stemText": "解下列方程： （1）2x+5（x+1）＝6； （2） ．",
  "stemParts": [
   {
    "t": "text",
    "v": "解下列方程： （1）2x+5（x+1）＝6； （2） ．"
   }
  ],
  "rawParas": [
   "19．（12 分）·【较易】解下列方程：",
   "（1）2x+5（x+1）＝6；",
   "（2）          ．"
  ],
  "options": null,
  "optionParts": null,
  "key": null,
  "answer": null,
  "officialKey": null
 },
 {
  "id": "p2025-q20",
  "paperId": "p2025",
  "year": "2025—2026",
  "no": 20,
  "qtype": "calc",
  "chapter": "ch-geo",
  "cat": "作图",
  "score": 5,
  "diff": "mid",
  "topic": "尺规作图与说理",
  "name": "尺规作图（截取线段）",
  "bonus": false,
  "hasAnswer": true,
  "stemText": "如图，已知线段 AB 和线段 a，b（AB＞b＞a）． （1）使用直尺和圆规，按下列要求作图（不要求写作法，保留作图痕迹）： ①在线段 AB 上截取 AC＝a； ②在线段 AB 的延长线上作线段 BD＝b． （2）在（1）的条件下，若 AB＝6，a＝3，b＝5，且点 E 是线段 CD 的中点，则线段 CD 的长为 ， 线段 AE 的长为 ．",
  "stemParts": [
   {
    "t": "text",
    "v": "如图，已知线段 AB 和线段 a，b（AB＞b＞a）． （1）使用直尺和圆规，按下列要求作图（不要求写作法，保留作图痕迹）： ①在线段 AB 上截取 AC＝a； ②在线段 AB 的延长线上作线段 BD＝b． （2）在（1）的条件下，若 AB＝6，a＝3，b＝5，且点 E 是线段 CD 的中点，则线段 CD 的长为 ， 线段 AE 的长为 ．"
   },
   {
    "t": "break"
   },
   {
    "t": "img",
    "src": "media/q20-img-043.png",
    "kind": "figure"
   }
  ],
  "rawParas": [
   "20．（5 分）·【较易】如图，已知线段 AB 和线段 a，b（AB＞b＞a）．",
   "（1）使用直尺和圆规，按下列要求作图（不要求写作法，保留作图痕迹）：",
   "①在线段 AB 上截取 AC＝a；",
   "②在线段 AB 的延长线上作线段 BD＝b．",
   "（2）在（1）的条件下，若 AB＝6，a＝3，b＝5，且点 E 是线段 CD 的中点，则线段 CD 的长为   ，",
   "线段 AE 的长为         ．"
  ],
  "options": null,
  "optionParts": null,
  "key": null,
  "answer": "8；7",
  "accept": [
   "8；7"
  ],
  "officialKey": "8；7"
 },
 {
  "id": "p2025-q21",
  "paperId": "p2025",
  "year": "2025—2026",
  "no": 21,
  "qtype": "big",
  "chapter": "ch-eq",
  "cat": "建模",
  "score": 7,
  "diff": "mid",
  "topic": "方程应用（配套）",
  "name": "三棱柱裁剪配套",
  "bonus": false,
  "hasAnswer": true,
  "stemText": "如图，初一年级组设计了一款三棱柱形状的文创产品包装盒，现在要用正方形印花 纸为这些三棱柱盒子做贴面装饰．每个盒子由 3 个长方形侧面和 2 个等边三角形底面组成，正方形印花 纸有如图所示的两种裁剪方法（裁剪后的边角料不再利用）． 现有 25 张正方形印花纸，全部用以上两种方法之一进行裁剪． （1）若其中，张用方法一裁剪，则能得到 个侧面和 个底面；剩余的印花纸用方 法二裁剪能得到 个侧面； （2）若裁剪出的侧面和底面恰好全部用完，能装饰多少个盒子？",
  "stemParts": [
   {
    "t": "text",
    "v": "如图，初一年级组设计了一款三棱柱形状的文创产品包装盒，现在要用正方形印花 纸为这些三棱柱盒子做贴面装饰．每个盒子由 3 个长方形侧面和 2 个等边三角形底面组成，正方形印花 纸有如图所示的两种裁剪方法（裁剪后的边角料不再利用）． 现有 25 张正方形印花纸，全部用以上两种方法之一进行裁剪． （1）若其中，张用方法一裁剪，则能得到 个侧面和 个底面；剩余的印花纸用方 法二裁剪能得到 个侧面； （2）若裁剪出的侧面和底面恰好全部用完，能装饰多少个盒子？"
   },
   {
    "t": "break"
   },
   {
    "t": "img",
    "src": "media/q21-img-044.png",
    "kind": "figure"
   }
  ],
  "rawParas": [
   "（7 分）·【中档】如图，初一年级组设计了一款三棱柱形状的文创产品包装盒，现在要用正方形印花",
   "纸为这些三棱柱盒子做贴面装饰．每个盒子由 3 个长方形侧面和 2 个等边三角形底面组成，正方形印花",
   "纸有如图所示的两种裁剪方法（裁剪后的边角料不再利用）．",
   "现有 25 张正方形印花纸，全部用以上两种方法之一进行裁剪．",
   "（1）若其中，张用方法一裁剪，则能得到                  个侧面和    个底面；剩余的印花纸用方",
   "法二裁剪能得到                   个侧面；",
   "（2）若裁剪出的侧面和底面恰好全部用完，能装饰多少个盒子？"
  ],
  "options": null,
  "optionParts": null,
  "key": null,
  "answer": "6x，7x；（200﹣8x）；",
  "officialKey": "6x，7x；（200﹣8x）；"
 },
 {
  "id": "p2025-q22",
  "paperId": "p2025",
  "year": "2025—2026",
  "no": 22,
  "qtype": "big",
  "chapter": "ch-op",
  "cat": "推理",
  "score": 5,
  "diff": "hard",
  "topic": "进位制（综合与实践）",
  "name": "十六进制颜色编码",
  "bonus": false,
  "hasAnswer": true,
  "stemText": "在网页设计中，颜色常用十六进制编码表示，格式为：以#开头，紧跟着六位字符 从左到右．每两位一组．分别代表红色、绿色、蓝色的强度，强度值用十六进制数表示． 十六进制是逢十六进一，其表示引用了字母 A 至 F，与十进制数位上数字的对应关系如表： 十进制 0 1 2 3 4 5 6 7 8 9 10 11 12 13 14 15 十六进制 0 1 2 3 4 5 6 7 8 9 A B C D E F 十六进制数与十进制数的换算方法为：从右向左，每个数位上的数分别乘 160，161，162，163，⋯，再 把所得的积相加． 例 如 ， 两 位 的 十 六 进 制 数 1A ， 可 简 单 写 为 （ 1A ） 16 ， 换 算 为 十 进 制 数 的 过 程 如 下 ： ．（规定：当 a≠0 时，a0＝1） 某颜色的十六进制编码为#4C1A5F，请回答以下问题： （1）该颜色代码中红色、绿色、蓝色三个部分对应的十六进制数分别为： 红色部分； ，绿色部分； ，蓝色部分； ； （2）将红色部分对应的十六进制数转换为十进制数，并写出转换过程； （3）根据某图案设计要求，需将该颜色“变暖”．设计师将红色的十进制数值增加 30，绿色的十进制 数值增加 10，蓝色的十进制数值减少 10，得到了较满意的效果，调整后的颜色的十六进制编码为 # ．",
  "stemParts": [
   {
    "t": "text",
    "v": "在网页设计中，颜色常用十六进制编码表示，格式为：以#开头，紧跟着六位字符 从左到右．每两位一组．分别代表红色、绿色、蓝色的强度，强度值用十六进制数表示． 十六进制是逢十六进一，其表示引用了字母 A 至 F，与十进制数位上数字的对应关系如表： 十进制 0 1 2 3 4 5 6 7 8 9 10 11 12 13 14 15 十六进制 0 1 2 3 4 5 6 7 8 9 A B C D E F 十六进制数与十进制数的换算方法为：从右向左，每个数位上的数分别乘 160，161，162，163，⋯，再 把所得的积相加． 例 如 ， 两 位 的 十 六 进 制 数 1A ， 可 简 单 写 为 （ 1A ） 16 ， 换 算 为 十 进 制 数 的 过 程 如 下 ： ．（规定：当 a≠0 时，a0＝1） 某颜色的十六进制编码为#4C1A5F，请回答以下问题： （1）该颜色代码中红色、绿色、蓝色三个部分对应的十六进制数分别为： 红色部分； ，绿色部分； ，蓝色部分； ； （2）将红色部分对应的十六进制数转换为十进制数，并写出转换过程； （3）根据某图案设计要求，需将该颜色“变暖”．设计师将红色的十进制数值增加 30，绿色的十进制 数值增加 10，蓝色的十进制数值减少 10，得到了较满意的效果，调整后的颜色的十六进制编码为 # ．"
   },
   {
    "t": "break"
   },
   {
    "t": "img",
    "rid": "figure",
    "src": "media/q22-f-005.png",
    "kind": "figure"
   }
  ],
  "rawParas": [
   "22．（5 分）·【中档】在网页设计中，颜色常用十六进制编码表示，格式为：以#开头，紧跟着六位字符",
   "从左到右．每两位一组．分别代表红色、绿色、蓝色的强度，强度值用十六进制数表示．",
   "十六进制是逢十六进一，其表示引用了字母 A 至 F，与十进制数位上数字的对应关系如表：",
   "十进制 0 1 2 3 4 5 6 7 8 9 10 11 12 13 14 15",
   "十六进制 0 1 2 3 4 5 6 7 8 9 A B C D E F",
   "十六进制数与十进制数的换算方法为：从右向左，每个数位上的数分别乘 160，161，162，163，⋯，再",
   "把所得的积相加．",
   "例 如 ， 两 位 的 十 六 进 制 数 1A ， 可 简 单 写 为 （ 1A ） 16 ， 换 算 为 十 进 制 数 的 过 程 如 下 ：",
   "．（规定：当 a≠0 时，a0＝1）",
   "某颜色的十六进制编码为#4C1A5F，请回答以下问题：",
   "（1）该颜色代码中红色、绿色、蓝色三个部分对应的十六进制数分别为：",
   "红色部分；                   ，绿色部分；                  ，蓝色部分；       ；",
   "（2）将红色部分对应的十六进制数转换为十进制数，并写出转换过程；",
   "（3）根据某图案设计要求，需将该颜色“变暖”．设计师将红色的十进制数值增加 30，绿色的十进制",
   "数值增加 10，蓝色的十进制数值减少 10，得到了较满意的效果，调整后的颜色的十六进制编码为",
   "#                 ．"
  ],
  "options": null,
  "optionParts": null,
  "key": null,
  "answer": "4C，1A，5F；",
  "officialKey": "4C，1A，5F；"
 },
 {
  "id": "p2025-q23",
  "paperId": "p2025",
  "year": "2025—2026",
  "no": 23,
  "qtype": "big",
  "chapter": "ch-rational",
  "cat": "分类",
  "score": 6,
  "diff": "top",
  "topic": "数轴动点与分类",
  "name": "数轴多动点 + 定值含参",
  "bonus": false,
  "hasAnswer": true,
  "stemText": "在数轴上，点 A，B，C 分别表示数﹣5，10，20，数轴上有一动点 M 从点 A 出发， 以每秒 2 个单位长度的速度沿数轴正方向运动，设运动时间为 t 秒（t＞0）． （1）点 M 表示的数是 （用含 t 的式子表示）； （2）当 M，B 两点之间相距 5 个单位长度时，求 t 的值； （3）若点 D，E，F 分别从点 A，B，C 的位置出发与点 M 在数轴上同时开始运动，点 D 以每秒 1 个单 位长度的速度沿数轴负方向运动，点 E 和点 F 分别以每秒 3 个单位长度和每秒 4 个单位长度的速度沿 数轴正方向运动，在这个运动过程中，已知存在常数 n，使得 ME﹣3MF+nMD 为一个定值，则 n 的值 为 ．",
  "stemParts": [
   {
    "t": "text",
    "v": "在数轴上，点 A，B，C 分别表示数﹣5，10，20，数轴上有一动点 M 从点 A 出发， 以每秒 2 个单位长度的速度沿数轴正方向运动，设运动时间为 t 秒（t＞0）． （1）点 M 表示的数是 （用含 t 的式子表示）； （2）当 M，B 两点之间相距 5 个单位长度时，求 t 的值； （3）若点 D，E，F 分别从点 A，B，C 的位置出发与点 M 在数轴上同时开始运动，点 D 以每秒 1 个单 位长度的速度沿数轴负方向运动，点 E 和点 F 分别以每秒 3 个单位长度和每秒 4 个单位长度的速度沿 数轴正方向运动，在这个运动过程中，已知存在常数 n，使得 ME﹣3MF+nMD 为一个定值，则 n 的值 为 ．"
   },
   {
    "t": "break"
   },
   {
    "t": "img",
    "src": "media/q23-img-046.png",
    "kind": "figure"
   }
  ],
  "rawParas": [
   "23．（6 分）·【中档】在数轴上，点 A，B，C 分别表示数﹣5，10，20，数轴上有一动点 M 从点 A 出发，",
   "以每秒 2 个单位长度的速度沿数轴正方向运动，设运动时间为 t 秒（t＞0）．",
   "（1）点 M 表示的数是                         （用含 t 的式子表示）；",
   "（2）当 M，B 两点之间相距 5 个单位长度时，求 t 的值；",
   "（3）若点 D，E，F 分别从点 A，B，C 的位置出发与点 M 在数轴上同时开始运动，点 D 以每秒 1 个单",
   "位长度的速度沿数轴负方向运动，点 E 和点 F 分别以每秒 3 个单位长度和每秒 4 个单位长度的速度沿",
   "数轴正方向运动，在这个运动过程中，已知存在常数 n，使得 ME﹣3MF+nMD 为一个定值，则 n 的值",
   "为                          ．"
  ],
  "options": null,
  "optionParts": null,
  "key": null,
  "answer": "﹣5+2t；",
  "officialKey": "﹣5+2t；"
 },
 {
  "id": "p2025-q24",
  "paperId": "p2025",
  "year": "2025—2026",
  "no": 24,
  "qtype": "big",
  "chapter": "ch-geo",
  "cat": "分类",
  "score": 7,
  "diff": "top",
  "topic": "动角（旋转）",
  "name": "动角 + 三等分线（含参）",
  "bonus": false,
  "hasAnswer": true,
  "stemText": "已知∠AOB＝α（0°＜α＜180°）． （1）若 0°＜α＜90°，∠BOC 与∠AOB 互余，射线 OD 平分∠BOC． ①如图 1，α＝60°时，若射线 OD 在∠AOB 内部，则∠AOD＝ ； ②α＜30°时，画出符合题意的图形，并求∠AOD 的度数（用含 α 的式子表示）； （2）若 90°＜α＜180°，∠BOC 与∠AOB 互补，射线 OD 平分∠BOC，射线 OE 是∠AOD 的一条三 等分线，则∠BOE 的度数为 ．",
  "stemParts": [
   {
    "t": "text",
    "v": "已知∠AOB＝α（0°＜α＜180°）． （1）若 0°＜α＜90°，∠BOC 与∠AOB 互余，射线 OD 平分∠BOC． ①如图 1，α＝60°时，若射线 OD 在∠AOB 内部，则∠AOD＝ ； ②α＜30°时，画出符合题意的图形，并求∠AOD 的度数（用含 α 的式子表示）； （2）若 90°＜α＜180°，∠BOC 与∠AOB 互补，射线 OD 平分∠BOC，射线 OE 是∠AOD 的一条三 等分线，则∠BOE 的度数为 ．"
   },
   {
    "t": "break"
   },
   {
    "t": "img",
    "src": "media/q24-img-047.png",
    "kind": "figure"
   }
  ],
  "rawParas": [
   "24．（7 分）·【较难】已知∠AOB＝α（0°＜α＜180°）．",
   "（1）若 0°＜α＜90°，∠BOC 与∠AOB 互余，射线 OD 平分∠BOC．",
   "①如图 1，α＝60°时，若射线 OD 在∠AOB 内部，则∠AOD＝                              ；",
   "②α＜30°时，画出符合题意的图形，并求∠AOD 的度数（用含 α 的式子表示）；",
   "（2）若 90°＜α＜180°，∠BOC 与∠AOB 互补，射线 OD 平分∠BOC，射线 OE 是∠AOD 的一条三",
   "等分线，则∠BOE 的度数为                           ．"
  ],
  "options": null,
  "optionParts": null,
  "key": null,
  "answer": "45°；",
  "officialKey": "45°；"
 },
 {
  "id": "p2025-q25",
  "paperId": "p2025",
  "year": "2025—2026",
  "no": 25,
  "qtype": "big",
  "chapter": "ch-op",
  "cat": "新定义",
  "score": 4,
  "diff": "mid",
  "topic": "新定义运算",
  "name": "新定义运算（⊙）",
  "bonus": true,
  "hasAnswer": true,
  "stemText": "对任意两个有理数 a，b 定义一种新运算： ． （1）计算：3⊙（﹣1）＝ ； （2）有下列四个结论（括号的作用与它在有理数运算中的作用相同）： ①a⊙b＝b⊙a； ②（﹣a）⊙（﹣b）＝﹣（b⊙a）； ③ ； ④ ． 其中所有正确结论的序号是 ．",
  "stemParts": [
   {
    "t": "text",
    "v": "对任意两个有理数 a，b 定义一种新运算： ． （1）计算：3⊙（﹣1）＝ ； （2）有下列四个结论（括号的作用与它在有理数运算中的作用相同）： ①a⊙b＝b⊙a； ②（﹣a）⊙（﹣b）＝﹣（b⊙a）； ③ ； ④ ． 其中所有正确结论的序号是 ．"
   }
  ],
  "rawParas": [
   "25．（4 分）·【中档】对任意两个有理数 a，b 定义一种新运算：               ．",
   "（1）计算：3⊙（﹣1）＝                        ；",
   "（2）有下列四个结论（括号的作用与它在有理数运算中的作用相同）：",
   "①a⊙b＝b⊙a；",
   "②（﹣a）⊙（﹣b）＝﹣（b⊙a）；",
   "③                  ；",
   "④                             ．",
   "其中所有正确结论的序号是              ．"
  ],
  "options": null,
  "optionParts": null,
  "key": null,
  "answer": null,
  "officialKey": "﹣ ；"
 },
 {
  "id": "p2025-q26",
  "paperId": "p2025",
  "year": "2025—2026",
  "no": 26,
  "qtype": "big",
  "chapter": "ch-rational",
  "cat": "新定义",
  "score": 6,
  "diff": "top",
  "topic": "新定义（数轴类）",
  "name": "新定义「传送距离」",
  "bonus": true,
  "hasAnswer": true,
  "stemText": "传送门是科幻小说中常见的构想．通过传送门，可以从一个地方瞬间转移到另一个 地方．如图，在数轴的原点 O 和点 A 处分别有一扇传送门，其中点 A 表示的数为 360．当一个点移动 至其中一扇传送门时，它会被瞬间转移到另一扇传送门，之后继续移动．对于线段 OA 上的两点 P，Q （点 P，Q 不与端点 O，A 重合），想让点 P 移动到点 Q 有两种方法：一种是不经过传送门直接移动到 点 Q；另一种是点 P 先移动到离它更近的传送门处，瞬间转移至另一扇传送门后，再移动到点 Q．我们 将这两种移动方法中移动距离的最小值称为 P﹣Q 的“传送距离”． 已知点 B，C，D 在数轴上对应的数分别为 80，200，300， （1）B﹣C 的“传送距离”为 ，B﹣D 的“传送距离”为 ； （2）线段 OA 上任意两点（不与端点 O，A 重合）的“传送距离”的最大值为 ； （3）点 R 是线段 OA 上任意一点（点 R 不与端点 O，A 重合），将 B﹣R，C﹣R 和 D﹣R 的“传送距离” 分别记为 dB，dC，dD，则 dB+dC+dD 的最大值为 ，取得最大值时点 R 所表示的数为 ．",
  "stemParts": [
   {
    "t": "text",
    "v": "传送门是科幻小说中常见的构想．通过传送门，可以从一个地方瞬间转移到另一个 地方．如图，在数轴的原点 O 和点 A 处分别有一扇传送门，其中点 A 表示的数为 360．当一个点移动 至其中一扇传送门时，它会被瞬间转移到另一扇传送门，之后继续移动．对于线段 OA 上的两点 P，Q （点 P，Q 不与端点 O，A 重合），想让点 P 移动到点 Q 有两种方法：一种是不经过传送门直接移动到 点 Q；另一种是点 P 先移动到离它更近的传送门处，瞬间转移至另一扇传送门后，再移动到点 Q．我们 将这两种移动方法中移动距离的最小值称为 P﹣Q 的“传送距离”． 已知点 B，C，D 在数轴上对应的数分别为 80，200，300， （1）B﹣C 的“传送距离”为 ，B﹣D 的“传送距离”为 ； （2）线段 OA 上任意两点（不与端点 O，A 重合）的“传送距离”的最大值为 ； （3）点 R 是线段 OA 上任意一点（点 R 不与端点 O，A 重合），将 B﹣R，C﹣R 和 D﹣R 的“传送距离” 分别记为 dB，dC，dD，则 dB+dC+dD 的最大值为 ，取得最大值时点 R 所表示的数为 ．"
   },
   {
    "t": "break"
   },
   {
    "t": "img",
    "src": "media/q26-img-051.png",
    "kind": "figure"
   }
  ],
  "rawParas": [
   "（6 分）·【较难】传送门是科幻小说中常见的构想．通过传送门，可以从一个地方瞬间转移到另一个",
   "地方．如图，在数轴的原点 O 和点 A 处分别有一扇传送门，其中点 A 表示的数为 360．当一个点移动",
   "至其中一扇传送门时，它会被瞬间转移到另一扇传送门，之后继续移动．对于线段 OA 上的两点 P，Q",
   "（点 P，Q 不与端点 O，A 重合），想让点 P 移动到点 Q 有两种方法：一种是不经过传送门直接移动到",
   "点 Q；另一种是点 P 先移动到离它更近的传送门处，瞬间转移至另一扇传送门后，再移动到点 Q．我们",
   "将这两种移动方法中移动距离的最小值称为 P﹣Q 的“传送距离”．",
   "已知点 B，C，D 在数轴上对应的数分别为 80，200，300，",
   "（1）B﹣C 的“传送距离”为               ，B﹣D 的“传送距离”为    ；",
   "（2）线段 OA 上任意两点（不与端点 O，A 重合）的“传送距离”的最大值为             ；",
   "（3）点 R 是线段 OA 上任意一点（点 R 不与端点 O，A 重合），将 B﹣R，C﹣R 和 D﹣R 的“传送距离”",
   "分别记为 dB，dC，dD，则 dB+dC+dD 的最大值为         ，取得最大值时点 R 所表示的数为   ．"
  ],
  "options": null,
  "optionParts": null,
  "key": null,
  "answer": "120；140；",
  "officialKey": "120；140；"
 }
];
