export type TokenPointAction = {
    version: 1;
    title: "Staking" | "Un Staking";
    data: {
        amount: string;
        source: "stake" | "unstake";
        direction: "increase" | "decrease";
    };
};

export type PointAction = TokenPointAction;
