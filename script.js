const $ = (id) => document.getElementById(id);
const currency = (amount) => new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 0 }).format(Math.round(amount));
const today = new Date();
const datePlus = (n) => { const d = new Date(today); d.setDate(d.getDate() + n); return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,"0")}-${String(d.getDate()).padStart(2,"0")}`; };
$("startDate").value = datePlus(14);
$("endDate").value = datePlus(15);
$("startDate").min = datePlus(0);
$("endDate").min = $("startDate").value;

$("startDate").addEventListener("change", () => {
  $("endDate").min = $("startDate").value;
  if ($("endDate").value < $("startDate").value) $("endDate").value = $("startDate").value;
});
$("minusBtn").addEventListener("click", () => $("travellers").value = Math.max(1, Number($("travellers").value || 1) - 1));
$("plusBtn").addEventListener("click", () => $("travellers").value = Math.min(20, Number($("travellers").value || 1) + 1));
$("demoBtn").addEventListener("click", () => {
  $("destination").value = "Ooty"; $("startDate").value = datePlus(14); $("endDate").value = datePlus(15);
  $("budget").value = 10000; $("travellers").value = 2;
  document.querySelectorAll('input[name="interest"]').forEach(el => el.checked = ["Nature","Sightseeing"].includes(el.value));
});
$("tripForm").addEventListener("submit", (event) => { event.preventDefault(); generateItinerary(); });
$("regenerateBtn").addEventListener("click", generateItinerary);
$("printBtn").addEventListener("click", () => window.print());

function getInputs() {
  const start = new Date(`${$("startDate").value}T12:00:00`);
  const end = new Date(`${$("endDate").value}T12:00:00`);
  const days = Math.floor((end - start) / 86400000) + 1;
  return {
    destination: $("destination").value.trim(),
    start: $("startDate").value, end: $("endDate").value,
    days, budget: Number($("budget").value),
    travellers: Number($("travellers").value),
    interests: [...document.querySelectorAll('input[name="interest"]:checked')].map(el => el.value)
  };
}

function generateItinerary() {
  const t = getInputs();
  if (!t.destination || !t.start || !t.end || t.days < 1 || t.budget <= 0 || t.travellers < 1) {
    alert("Please enter valid trip details and make sure the end date is not before the start date."); return;
  }
  if (t.days > 14) { alert("For this practical demo, please choose a trip of 1–14 days."); return; }
  if (!t.interests.length) { alert("Please select at least one interest."); return; }

  // Illustrative estimate: initial plan intentionally uses a premium hotel and a few paid activities.
  const initial = {
    transport: 1500 * t.travellers,
    accommodation: 2250 * t.days,
    food: 500 * t.travellers * t.days,
    sightseeing: 750 * t.travellers,
    other: 0
  };
  const initialTotal = sumCosts(initial);
  // Refine expensive accommodation and reduce some paid activity spending if needed.
  const refined = { ...initial };
  let rounds = 0;
  const history = [];
  history.push({label:"Initial plan", total:initialTotal, note:"Comfort hotel and regular paid sightseeing"});
  if (sumCosts(refined) > t.budget) {
    rounds++;
    refined.accommodation = 1500 * t.days;
    history.push({label:"Choose a budget hotel", total:sumCosts(refined), note:"Lower accommodation cost while keeping the trip duration"});
  }
  if (sumCosts(refined) > t.budget) {
    rounds++;
    refined.sightseeing = 350 * t.travellers;
    history.push({label:"Mix free and paid attractions", total:sumCosts(refined), note:"Keep the main interests and replace selected paid stops"});
  }
  if (sumCosts(refined) > t.budget) {
    rounds++;
    refined.transport = 900 * t.travellers;
    history.push({label:"Use shared/public transport", total:sumCosts(refined), note:"Reduce transport cost; travel time may increase"});
  }
  if (sumCosts(refined) > t.budget) {
    rounds++;
    refined.other = 100 * t.travellers;
    history.push({label:"Reduce optional extras", total:sumCosts(refined), note:"Keep essentials and remove optional spending"});
  }

  const finalTotal = sumCosts(refined);
  const feasible = finalTotal <= t.budget;
  renderResults(t, initial, initialTotal, refined, finalTotal, rounds, history, feasible);
}

function sumCosts(obj) { return Object.values(obj).reduce((a,b) => a+b, 0); }

function renderResults(t, initial, initialTotal, final, finalTotal, rounds, history, feasible) {
  $("emptyState").classList.add("hidden"); $("results").classList.remove("hidden");
  $("resultTitle").textContent = `${t.destination}, thoughtfully planned`;
  $("resultSubtitle").textContent = `${formatDate(t.start)} – ${formatDate(t.end)} · ${t.days} day${t.days>1?"s":""} · ${t.travellers} traveller${t.travellers>1?"s":""} · ${t.interests.join(", ")}`;
  $("statusPill").textContent = feasible ? "Constraints satisfied" : "Budget needs review";
  $("statusPill").style.color = feasible ? "var(--green)" : "#c56d31";
  $("statusPill").style.background = feasible ? "#e9f8f1" : "#fff0e8";
  $("statusPill").style.borderColor = feasible ? "#ccefe0" : "#f5d6c3";
  $("finalCost").textContent = currency(finalTotal);
  $("costPerPerson").textContent = `${currency(finalTotal/t.travellers)} per person`;
  $("remaining").textContent = currency(Math.max(0,t.budget-finalTotal));
  $("budgetUsage").textContent = `${Math.min(999, Math.round(finalTotal/t.budget*100))}% of budget used`;
  $("rounds").textContent = rounds;

  $("initialCostBox").innerHTML = `<span>Initial plan estimate</span><strong>${currency(initialTotal)}</strong><span>${initialTotal <= t.budget ? "Within budget" : `${currency(initialTotal-t.budget)} over budget`}</span>`;
  const constraints = [
    {ok: finalTotal <= t.budget, title:"Budget constraint", detail:`Final estimate ${currency(finalTotal)} against a budget of ${currency(t.budget)}.`},
    {ok: t.days > 0 && t.days <= 14, title:"Travel-date constraint", detail:`The itinerary covers ${t.days} day${t.days>1?"s":""} between the selected dates.`},
    {ok: t.travellers >= 1, title:"Traveller constraint", detail:`Cost estimates account for ${t.travellers} traveller${t.travellers>1?"s":""}.`},
    {ok: t.interests.length > 0, title:"Interest constraint", detail:`The schedule prioritizes: ${t.interests.join(", ")}.`}
  ];
  $("constraintList").innerHTML = constraints.map(c => `<div class="constraint ${c.ok?"":"fail"}"><span class="check">${c.ok?"✓":"!"}</span><div><strong>${c.title}: ${c.ok?"PASS":"REVIEW"}</strong><br>${c.detail}</div></div>`).join("");

  const budgetHotelTotal = initialTotal - initial.accommodation + (1500*t.days);
  const mixedActivitiesTotal = budgetHotelTotal - initial.sightseeing + (350*t.travellers);
  const alternatives = [
    {name:"Premium accommodation",cost:initialTotal,trade:"More comfort; may exceed the budget.",selected: initialTotal<=t.budget},
    {name:"Budget accommodation",cost:budgetHotelTotal,trade:"Lower room cost; keeps planned activities.",selected:final.accommodation===1500*Math.ceil(t.days/2)},
    {name:"Free + paid attractions",cost:mixedActivitiesTotal,trade:"Lower activity spend; fewer paid experiences.",selected:final.sightseeing===350*t.travellers}
  ];
  $("comparisonRows").innerHTML = alternatives.map(a => `<tr><td>${a.name}</td><td>${currency(a.cost)}</td><td>${a.trade}</td><td><span class="decision ${a.selected?"":"alt"}">${a.selected?"Selected":"Alternative"}</span></td></tr>`).join("");

  const activities = buildActivities(t);
  $("itineraryDays").innerHTML = activities.map((day,i) => `<article class="day-card"><div class="day-heading"><strong>Day ${i+1} · ${formatDate(addDays(t.start,i))}</strong><span>${currency((final.food+final.sightseeing)/t.days)} daily food & activity average</span></div><div class="day-schedule">${day.map(item=>`<div class="schedule-row"><div class="schedule-time">${item.time}</div><div><strong>${item.title}</strong><p>${item.description}</p></div></div>`).join("")}</div></article>`).join("");

  const labels = [
    ["Transport",final.transport],["Accommodation",final.accommodation],["Food",final.food],["Sightseeing & activities",final.sightseeing],["Other expenses",final.other]
  ];
  $("budgetBreakdown").innerHTML = labels.map(([label,value]) => `<div class="budget-item"><div class="budget-item-head"><span>${label}</span><strong>${currency(value)}</strong></div><div class="bar-track"><div class="bar-fill" style="width:${Math.min(100, finalTotal ? value/finalTotal*100 : 0)}%"></div></div></div>`).join("");
  $("breakdownTotal").textContent = currency(finalTotal);
  $("breakdownRemaining").textContent = feasible ? currency(t.budget-finalTotal) : `${currency(finalTotal-t.budget)} over budget`;
}

function buildActivities(t) {
  const choices = [];
  if (t.interests.includes("Nature")) choices.push(
    {time:"9:00 AM",title:"Nature viewpoint / botanical garden",description:"Start with a scenic outdoor attraction; confirm opening times and entry fees before travel."},
    {time:"2:00 PM",title:"Lake, garden, or countryside walk",description:"Choose a relaxed outdoor stop that suits the group's pace."}
  );
  if (t.interests.includes("Sightseeing")) choices.push(
    {time:"10:30 AM",title:"Popular local sightseeing stop",description:"Visit a well-known landmark and allow time for photos and travel between stops."}
  );
  if (t.interests.includes("Adventure")) choices.push(
    {time:"8:30 AM",title:"Easy guided trail or outdoor activity",description:"Select an activity appropriate for all travellers and check safety requirements."}
  );
  if (t.interests.includes("History")) choices.push(
    {time:"11:00 AM",title:"Heritage site or local museum",description:"Explore local history; check admission and weekly closing days."}
  );
  if (t.interests.includes("Food")) choices.push(
    {time:"12:30 PM",title:"Local cuisine experience",description:"Try a local meal and keep the per-person food allowance in mind."}
  );
  if (t.interests.includes("Shopping")) choices.push(
    {time:"5:00 PM",title:"Local market and souvenir stop",description:"Explore local products while keeping optional purchases within the budget."}
  );
  choices.push({time:"6:00 PM",title:"Dinner and next-day review",description:"Have dinner, review the day's expenses, and adjust optional activities if needed."});
  const days = [];
  for(let i=0;i<t.days;i++) {
    const dayItems = [];
    const picks = choices.filter((_,idx)=> (idx+i)%Math.max(1,Math.min(choices.length,3)) !== 2).slice(0,3);
    dayItems.push(...picks);
    if(dayItems.length<3) dayItems.push(...choices.slice(0,3-dayItems.length));
    dayItems.sort((a,b)=>timeNumber(a.time)-timeNumber(b.time));
    days.push(dayItems.slice(0,4));
  }
  return days;
}
function timeNumber(s){const [time,ampm]=s.split(" ");let [h,m]=time.split(":").map(Number);if(ampm==="PM"&&h!==12)h+=12;if(ampm==="AM"&&h===12)h=0;return h*60+m;}
function formatDate(s){return new Date(`${s}T12:00:00`).toLocaleDateString("en-IN",{day:"numeric",month:"short",year:"numeric"});}
function addDays(s,n){const d=new Date(`${s}T12:00:00`);d.setDate(d.getDate()+n);return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,"0")}-${String(d.getDate()).padStart(2,"0")}`;}
