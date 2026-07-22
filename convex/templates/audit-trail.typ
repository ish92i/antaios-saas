#let data = json(sys.inputs.data)
#let logo-path = sys.inputs.at("logo", default: data.at("logoPath", default: ""))
#let labels = data.at("labels", default: (:))
#let brand = data.at("brand", default: (:))

#let l(key) = labels.at(key, default: key)
#let val(value) = if value == none or value == "" { "-" } else { str(value) }
#let brand-color(key, fallback) = rgb(brand.at(key, default: fallback))
#let brand-font(key, fallback) = brand.at(key, default: fallback)

#let ink = brand-color("ink", "#18201c")
#let muted = brand-color("muted", "#647067")
#let rule-color = brand-color("line", "#dce4dc")
#let soft = brand-color("soft", "#f4f7f1")
#let accent = brand-color("accent", "#2f6f4e")
#let danger = brand-color("danger", "#b42318")
#let font-main = brand-font("fontMain", "Liberation Sans")
#let font-mono = brand-font("fontMono", "DejaVu Sans Mono")

#set document(title: data.at("title", default: l("title")), author: "Antaios")
#set text(font: font-main, size: 9pt, fill: ink, lang: data.at("locale", default: "en"))
#set page(
  paper: "a4",
  margin: (x: 20mm, top: 27mm, bottom: 24mm),
  header: [
    #v(6pt)
    #grid(
      columns: (44pt, 1fr, auto),
      column-gutter: 10pt,
      align: (left, horizon),
      image(logo-path, width: 38pt),
      [
        #text(size: 13pt, weight: "bold", fill: ink)[#val(data.at("title", default: l("title")))]
        #linebreak()
        #text(size: 7.5pt, fill: muted)[#l("shipment_ref"): #val(data.at("shipmentReference", default: none))]
      ],
      [
        #align(right)[
          #text(size: 7.5pt, fill: muted)[#l("generated_on")]
          #linebreak()
          #text(size: 9pt, weight: "bold", fill: ink)[#val(data.at("generatedOn", default: none))]
        ]
      ],
    )
    #v(1pt)
    #line(length: 100%, stroke: 0.6pt + rule-color)
  ],
  footer: context [
    #line(length: 100%, stroke: 0.5pt + rule-color)
    #v(4pt)
    #grid(
      columns: (1fr, auto),
      column-gutter: 8pt,
      [
        #text(size: 6.7pt, fill: muted)[
          #l("document_stamp"): #val(data.at("documentVersion", default: none)) / #val(data.at("documentHash", default: "-")).slice(0, calc.min(16, val(data.at("documentHash", default: "-")).len()))
          #linebreak()
          #val(data.at("retentionNotice", default: l("retention_notice"))) (#val(data.at("retentionAnchor", default: none)))
        ]
      ],
      align(right)[
        #text(size: 7pt, fill: muted)[#l("page") #counter(page).display() / #counter(page).final().first()]
      ],
    )
  ],
)

#let label-value(label, value) = [
  #block(
    fill: soft,
    inset: 7pt,
    radius: 4pt,
    stroke: 0.4pt + rule-color,
    width: 100%,
  )[
    #text(size: 6.8pt, weight: "bold", fill: muted)[#label]
    #linebreak()
    #text(size: 9pt, fill: ink)[#val(value)]
  ]
]

#let eval-pill(text-value, flagged) = {
  let fill-color = if flagged { rgb("#fff1f0") } else { rgb("#eef7ee") }
  let stroke-color = if flagged { danger } else { accent }
  box(
    inset: (x: 5pt, y: 2.5pt),
    radius: 12pt,
    fill: fill-color,
    stroke: 0.5pt + stroke-color,
  )[#text(size: 7.4pt, weight: "bold", fill: stroke-color)[#val(text-value)]]
}

#let info = data.at("shipment", default: (:))

#grid(
  columns: (1fr, 1fr),
  gutter: 7pt,
  label-value(l("company"), info.at("company", default: none)),
  label-value(l("eori"), info.at("eori", default: none)),
  label-value(l("commodity"), info.at("commodity", default: none)),
  label-value(l("hs_code"), info.at("hsCode", default: none)),
  label-value(l("country_of_production"), info.at("countryOfProduction", default: none)),
  label-value(l("supplier"), info.at("supplier", default: none)),
  label-value(l("quantity"), info.at("quantity", default: none)),
  label-value(l("plot_reference"), info.at("plotReference", default: none)),
  label-value(l("dds_reference"), info.at("ddsReference", default: none)),
  label-value(l("generated_on"), data.at("generatedOn", default: none)),
)

#v(13pt)

#text(size: 12pt, weight: "bold", fill: ink)[#l("risk_assessment")]
#v(5pt)

#let criteria-cells = data.at("criteria", default: ()).map(c => (
  [
    #text(weight: "bold")[#val(c.at("article10Criterion", default: none))]
    #linebreak()
    #val(c.at("label", default: none))
  ],
  [#eval-pill(c.at("evaluation", default: none), c.at("flagged", default: false))],
  [#text(size: 7.4pt, fill: muted)[#val(c.at("source", default: none))]],
  [#val(c.at("rationale", default: none))],
)).flatten()

#table(
  columns: (1.05fr, 0.75fr, 1fr, 2.1fr),
  inset: 6pt,
  gutter: 0pt,
  stroke: (_, y) => if y == 0 { 0pt } else { 0.35pt + rule-color },
  fill: (_, y) => if y == 0 { accent } else { white },
  table.header(
    [#text(fill: white, weight: "bold")[#l("article10") / #l("criterion")]],
    [#text(fill: white, weight: "bold")[#l("evaluation")]],
    [#text(fill: white, weight: "bold")[#l("source")]],
    [#text(fill: white, weight: "bold")[#l("rationale")]],
  ),
  ..criteria-cells,
)

#v(13pt)

#let verdict-danger = data.at("verdict", default: "negligible") != "negligible"
#block(
  width: 100%,
  inset: 10pt,
  radius: 5pt,
  fill: if verdict-danger { rgb("#fff7ed") } else { rgb("#f0f8f0") },
  stroke: 0.8pt + if verdict-danger { danger } else { accent },
)[
  #text(size: 10pt, weight: "bold", fill: if verdict-danger { danger } else { accent })[
    #l("verdict"): #val(data.at("verdictLabel", default: data.at("verdict", default: none)))
  ]
  #linebreak()
  #val(data.at("verdictRationale", default: none))
]

#let flagged = data.at("flaggedCriteria", default: ())
#if verdict-danger and flagged.len() > 0 [
  #v(11pt)
  #text(size: 11pt, weight: "bold")[#l("flagged_criteria")]
  #v(4pt)
  #for item in flagged [
    #block(inset: (left: 8pt, y: 3pt), stroke: (left: 2pt + danger))[
      #text(weight: "bold")[#val(item.at("label", default: item.at("id", default: none)))]
      #linebreak()
      #text(size: 8pt, fill: muted)[#l("mitigation_trigger"): #val(item.at("mitigationTrigger", default: none))]
    ]
  ]
]

#let actions = data.at("mitigationActions", default: ())
#if verdict-danger and actions.len() > 0 [
  #v(10pt)
  #text(size: 11pt, weight: "bold")[#l("mitigation_actions")]
  #v(4pt)
  #table(
    columns: (1fr, 80pt),
    inset: 6pt,
    stroke: 0.35pt + rule-color,
    table.header(
      [#text(weight: "bold")[#l("mitigation_actions")]],
      [#text(weight: "bold")[#l("date")]],
    ),
    ..actions.map(action => (
      [#val(action.at("action", default: none))],
      [#text(font: font-mono, size: 7.5pt)[#val(action.at("date", default: none))]],
    )).flatten(),
  )
]