from features.draft_generator.service import generate_draft

# Test Case 1
data1 = {
    "name": "Aisha",
    "date": "10 April",
    "location": "Mumbai",
    "description": "My phone was stolen in a train"
}

result1 = generate_draft(data1)

print("\n----- GENERATED DRAFT 1 -----\n")
print(result1["draft"])
print("\n-----------------------------")


# Test Case 2
data2 = {
    "name": "Rahul",
    "date": "5 March",
    "location": "Delhi",
    "description": "My bike was stolen outside my office"
}

result2 = generate_draft(data2)

print("\n----- GENERATED DRAFT 2 -----\n")
print(result2["draft"])
print("\n-----------------------------")