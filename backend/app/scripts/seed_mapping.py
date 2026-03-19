from app.services.seed import seed_defaults


def main() -> None:
    seed_defaults()
    print("Default IPC-BNS mappings seeded successfully.")


if __name__ == "__main__":
    main()
